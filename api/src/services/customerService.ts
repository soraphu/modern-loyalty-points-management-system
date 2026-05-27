import { prisma } from '../config/database';
import axios from 'axios';
import { ApiResponse } from '../utils/apiResponse';
import { CONFIG } from '../config/constants';
import { Auth } from './authService';
import { Logger } from '../utils/logger';

export interface LineProfileInput {
    userId: string;
    displayName: string;
    pictureUrl: string;
}

const logs = new Logger('Customer Service');

export class CustomerService {

    /**
     * Pulls customer's profile attributes directly from LINE services using an access token.
     */
    public static async getLineProfile(lineAccessToken: string) {
        try {
            const lineResponse = await axios.get(CONFIG.LINE_API, {
                headers: {
                    'Authorization': `Bearer ${lineAccessToken}`
                }
            });

            return lineResponse.data;
        } catch (error: any) {
            if (error.response) {
                throw ApiResponse.fail({
                    statusCode: 401,
                    msg: `LINE response : ${error.response.data.message}`,
                    error_code: 'LINE_VALIDATE_FAILED'
                });
            }

            if (error.payload) {
                throw error;
            }
            throw ApiResponse.internalServerError('Unable to get line profile an unexpected internal server error occurred.');
        }
    }

    /**
     * Syncs LINE data with the 'User' model using exact schema naming conventions.
     * Generates a structural record if the account does not exist in the DB yet.
     */
    public static async syncLineProfile(lineProfile: LineProfileInput) {
        try {
            return await prisma.user.upsert({
                where: { lineId: lineProfile.userId },
                update: {
                    lineDisplayName: lineProfile.displayName,
                    linePictureUrl: lineProfile.pictureUrl,
                },
                create: {
                    lineId: lineProfile.userId,
                    lineDisplayName: lineProfile.displayName,
                    linePictureUrl: lineProfile.pictureUrl,
                    totalPoints: 0,
                },
            });
        } catch (error: any) {
            if (error.payload) {
                throw error;
            }
            throw ApiResponse.internalServerError('Unable to sync with line profile an unexpected internal server error occurred.');
        }
    }

    /**
     * Pulls chronological transaction history details matching your User model UUID.
     */
    public static async fetchCustomerTransactions(userId: string) {
        try {
            return await prisma.transaction.findMany({
                where: { userId: userId },
                orderBy: { createdAt: 'desc' },
            });
        } catch (error: any) {
            if (error.payload) {
                throw error;
            }
            throw ApiResponse.internalServerError('Unable to get transactions an unexpected internal server error occurred.');
        }
    }

    /**
     * Matches your QrCode model properties. Validates that the token code isn't used or expired,
     * updates customer balances, and commits the ledger transaction.
     */
    public static async earnPoints(userId: string, codeString: string) {
        try {
            // Run an isolated interactive database transaction block to guarantee atomic balance handling
            return await prisma.$transaction(async (tx) => {
                // Find the QR code profile
                const qrCodeRecord = await tx.qrCode.findUnique({
                    where: { codeString: codeString },
                });

                if (!qrCodeRecord) {
                    throw ApiResponse.fail({
                        statusCode: 404,
                        msg: 'QR point token code is invalid or does not exist.',
                        error_code: 'NOT_FOUND'
                    });
                }

                if (qrCodeRecord.used) {
                    throw ApiResponse.fail({
                        statusCode: 400,
                        msg: 'This QR point token code has already been claimed.',
                        error_code: 'ALREADY_CLAIMED'
                    });
                }

                // Ensure current time context has not passed the expiry limit
                if (new Date() > qrCodeRecord.expiresAt) {
                    throw ApiResponse.fail({
                        statusCode: 410,
                        msg: 'This QR point token code has expired.',
                        error_code: 'EXPIRED'
                    });
                }

                // Update user balance using native model field labels
                await tx.user.update({
                    where: { id: userId },
                    data: { totalPoints: { increment: qrCodeRecord.pointValue } },
                });

                // Flag the unique QR row as spent
                await tx.qrCode.update({
                    where: { codeString: codeString },
                    data: { used: true },
                });

                // Log entry into the transactions ledger using the EARN transaction type string
                const transaction = await tx.transaction.create({
                    data: {
                        userId: userId,
                        referenceId: qrCodeRecord.id,
                        pointsAmount: qrCodeRecord.pointValue,
                        type: 'EARN',
                    },
                });

                return transaction;
            });
        } catch (error: any) {
            if (error.payload) {
                throw error;
            }
            throw ApiResponse.internalServerError('Unable to earn the points an unexpected internal server error occurred.');
        }
    }

    /**
     * Fetches all rewards filtered by active status configuration values.
     */
    public static async fetchAvailableRewards() {
        try {
            return await prisma.reward.findMany({
                where: { active: true },
                orderBy: { createdAt: 'desc' },
            });
        } catch (error: any) {
            if (error.payload) {
                throw error;
            }
            throw ApiResponse.internalServerError('Unable to fetch available rewards profile an unexpected internal server error occurred.');
        }
    }

    /**
     * Uses your structural Reward and Voucher layout models. Validates balance metrics, 
     * decrements total values, and provisions an outstanding pending digital voucher record.
     */
    public static async redeemReward(userId: string, rewardId: string) {
        try {
            // Run an isolated interactive database transaction block to guarantee atomic balance handling
            return await prisma.$transaction(async (tx) => {
                // Check reward item profile parameters
                const reward = await tx.reward.findUnique({
                    where: {
                        id: rewardId,
                        active: true
                    }
                });

                if (!reward) {
                    throw ApiResponse.fail({
                        statusCode: 404,
                        msg: 'Reward item is unavailable or does not exist.',
                        error_code: 'REWARD_NOT_FOUND'
                    });
                }

                // Verify user data and points balances
                const user = await tx.user.findUnique({
                    where: { id: userId },
                });

                if (!user) {
                    throw ApiResponse.fail({
                        statusCode: 404,
                        msg: 'User profile record not found.',
                        error_code: 'USER_NOT_FOUND'
                    });
                }

                if (user.totalPoints < reward.pointsCost) {
                    throw ApiResponse.fail({
                        statusCode: 400,
                        msg: 'Insufficient point reserves to complete this redemption.',
                        error_code: 'INSUFFICIENT_POINTS'
                    });
                }

                // Deduct reward costs from user profile totals
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: { totalPoints: { decrement: reward.pointsCost } },
                });

                // Calculate expiration cutoff limit (exactly 30 days from now)
                const expirationTimeline = new Date();
                expirationTimeline.setDate(expirationTimeline.getDate() + 30);

                const newVoucher = await Auth.createUniqueVoucher(userId, rewardId);
                logs.info('New Voucher : ', newVoucher);

                return { voucher: newVoucher, remainingPoints: updatedUser.totalPoints };
            });
        } catch (error: any) {
            if (error.payload) {
                throw error;
            }
            throw ApiResponse.internalServerError('Unable to redeem an unexpected internal server error occurred.');
        }
    }
}