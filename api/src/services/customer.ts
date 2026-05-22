import { prisma } from '../config/database';
import axios from 'axios';
import { ApiResponse } from '../utils/apiResponse';
import { CONFIG } from '../config/constants';

export interface LineProfileInput {
    line_id: string;
    display_name: string;
    picture_url: string;
}

export class CustomerService {

    public static async getLineProfile(lineAccessToken: string) {
        try {
            const lineProfileResponse = await axios.get(CONFIG.LINE_API, {
                headers: {
                    // This is the header line LINE requires to authorize your request
                    'Authorization': `Bearer ${lineAccessToken}`
                }
            });

            return lineProfileResponse;
        } catch (error: any) {
            if (error.response) {
                throw ApiResponse.fail({
                    statusCode: 401,
                    msg: `LINE response : ${error.response.data.message}`,
                    error_code: 'LINE_VALIDATE_FAILED'
                });
            }

            throw ApiResponse.internalServerError();
        }
    }// end

    /**
     * Syncs LINE data with the 'User' model using exact schema naming conventions.
     * Generates a structural record if the account does not exist in the DB yet.
     */

    public static async syncLineProfile(data: LineProfileInput) {
        return await prisma.user.upsert({
            where: { lineId: data.line_id },
            update: {
                lineDisplayName: data.display_name,
                linePictureUrl: data.picture_url,
            },
            create: {
                lineId: data.line_id,
                lineDisplayName: data.display_name,
                linePictureUrl: data.picture_url,
                totalPoints: 0, // Starts fresh with zero points
            },
        });
    }//end

    /**
     * Pulls chronological transaction history details matching your User model UUID.
     */
    public static async fetchCustomerTransactions(userId: string) {
        return await prisma.transaction.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        });
    }// end

    /**
     * Matches your QrCode model properties. Validates that the token code isn't used or expired,
     * updates customer balances, and commits the ledger transaction.
     */
    public static async earnPoints(userId: string, codeString: string) {
        return await prisma.$transaction(async (tx) => {
            // Find the QR code profile
            const qrCodeRecord = await tx.qrCode.findUnique({
                where: { codeString: codeString },
            });

            if (!qrCodeRecord) {
                throw new Error('QR point token code is invalid or does not exist.');
            }

            if (qrCodeRecord.used) {
                throw new Error('This QR point token code has already been claimed.');
            }

            // Ensure current time context has not passed the expiry limit
            if (new Date() > qrCodeRecord.expiresAt) {
                throw new Error('This QR point token code has expired.');
            }

            // Update user balance using native model field labels
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { totalPoints: { increment: qrCodeRecord.pointValue } },
            });

            // Flag the unique QR row as spent
            await tx.qrCode.update({
                where: { codeString: codeString },
                data: { used: true },
            });

            // Log entry into the transactions ledger using the EARN transaction enum type
            await tx.transaction.create({
                data: {
                    userId: userId,
                    referenceId: qrCodeRecord.id,
                    pointsAmount: qrCodeRecord.pointValue,
                    type: 'EARN',
                },
            });

            return { user: updatedUser, pointsEarned: qrCodeRecord.pointValue };
        });
    }

    /**
     * Fetches all rewards filtered by active status configuration values.
     */
    public static async fetchAvailableRewards() {
        return await prisma.reward.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
        });
    }// end

    /**
     * Uses your structural Reward and Voucher layout models. Validates balance metrics, 
     * decrements total values, and provisions an outstanding pending digital voucher record.
     */
    public static async redeemReward(userId: string, rewardId: string) {
        return await prisma.$transaction(async (tx) => {
            // Check reward item profile parameters
            const reward = await tx.reward.findUnique({
                where: { id: rewardId },
            });

            if (!reward || !reward.active) {
                throw new Error('Reward item is unavailable or does not exist.');
            }

            // Verify user data and points balances
            const user = await tx.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new Error('User profile record not found.');
            }

            if (user.totalPoints < reward.pointsCost) {
                throw new Error('Insufficient point reserves to complete this redemption.');
            }

            // Deduct reward costs from user profile totals
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { totalPoints: { decrement: reward.pointsCost } },
            });

            // Calculate expiration cutoff limit (exactly 30 days from now)
            const expirationTimeline = new Date();
            expirationTimeline.setDate(expirationTimeline.getDate() + 30);

            // Generate an outstanding structural Voucher record (defaults to PPENDING via schema configuration)
            const newVoucher = await tx.voucher.create({
                data: {
                    userId: userId,
                    rewardId: rewardId,
                    expiresAt: expirationTimeline,
                },
            });

            // Add log context to the system immutable audit ledger via the REDEEM transaction type enum
            await tx.transaction.create({
                data: {
                    userId: userId,
                    referenceId: newVoucher.id,
                    pointsAmount: reward.pointsCost,
                    type: 'REDEEM',
                },
            });

            return { voucher: newVoucher, remainingPoints: updatedUser.totalPoints };
        });
    }
}//end