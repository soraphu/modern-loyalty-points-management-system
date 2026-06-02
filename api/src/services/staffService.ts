import { TransactionType, VoucherStatus } from '../generated/prisma/client';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import crypto from 'crypto';
import { Logger } from '../utils/logger';
import { CONFIG } from '../config/constants';
import { Auth } from './authService';
import { Validation } from '../utils/validation';

const logs = new Logger('StaffService');

export class StaffService {

    /**
     * Ref: Gen Points Token.yml (POST {{baseURL}}{{ApiURL}}/admin/points-token)
     */
    public static async generatePointsToken(adminId: string, points: number) {
        try {
            // Generate a secure, unique string for the QR code mapping
            const uniqueCodeString = `PT-${crypto.randomBytes(16).toString('hex')}`;

            // Set an expiration timeframe (e.g., valid for 24 hours)
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            const uniqueHashedCodeString = await Auth.hashToken(uniqueCodeString);

            await prisma.qrCode.create({
                data: {
                    adminId: adminId,
                    hashedCodeString: uniqueHashedCodeString,
                    pointValue: points,
                    used: false,
                    expiresAt: expiresAt
                },
            });

            return uniqueCodeString;
        } catch (error: any) {
            throw ApiResponse.internalServerError('Unable to generate points token, an unexpected internal server error occurred.');
        }
    }

    /**
     * Ref: Fetch Vouchers.yml (POST {{baseURL}}{{ApiURL}}/admin/vouchers)
     */
    public static async fetchVouchersByCode(voucherCode: string) {
        try {
            // Locates vouchers matching the specific code payload, including nested rewards
            return await prisma.voucher.findUnique({
                where: {
                    voucherCode: voucherCode
                },
                select: {
                    id: true,
                    userId: true,
                    rewardId: true,
                    status: true,
                    createdAt: true,
                    expiresAt: true,
                    user: {
                        select: {
                            id: true,
                            lineId: true,
                            lineDisplayName: true,
                            linePictureUrl: true
                        }
                    },
                    reward: {
                        select: {
                            id: true,
                            rewardName: true,
                            pointsCost: true,
                            imageUrl: true,
                            active: true,
                            createdAt: true
                        }
                    }
                }
            });
        } catch (error: any) {
            throw ApiResponse.internalServerError('Unable to fetch vouchers data records, an unexpected internal server error occurred.');
        }
    }

    public static async cancelVoucher(voucherCode: string) {
        try {
            return await prisma.$transaction(async (tx) => {
                const voucher = await Validation.getValidatedVoucher(tx, voucherCode);

                const cancelledVoucher = await tx.voucher.update({
                    where: { voucherCode: voucherCode },
                    data: { status: VoucherStatus.CANCELLED }
                });

                // Refund points for a normal active cancellation request
                await Auth.returnCustomerPoints(voucher.userId, voucher.reward.pointsCost);

                return {
                    cancelled_voucher: cancelledVoucher,
                    return_points: {
                        userId: voucher.userId,
                        returnPoints: voucher.reward.pointsCost
                    }
                };
            });
        } catch (error: any) {
            if (error.payload) throw error;

            logs.error('[VOUCHER FAULT] cancelVoucher execution failed', error);
            throw ApiResponse.internalServerError('Unable to complete voucher cancellation.');
        }
    }

    /**
     * Settle Voucher (Will now auto-refund if the voucher is expired)
     */
    public static async settleVoucher(voucherCode: string) {
        try {
            return await prisma.$transaction(async (tx) => {
                const voucher = await Validation.getValidatedVoucher(tx, voucherCode);

                await tx.voucher.update({
                    where: { voucherCode: voucherCode },
                    data: { status: VoucherStatus.CLAIMED }
                });

                const transaction = await tx.transaction.create({
                    data: {
                        userId: voucher.userId,
                        referenceId: voucher.id,
                        pointsAmount: -voucher.reward.pointsCost,
                        type: TransactionType.REDEEM
                    },
                    select: {
                        id: true,
                        userId: true,
                        referenceId: true,
                        pointsAmount: true,
                        type: true,
                        createdAt: true
                    }
                });

                return { transaction: transaction, settled_voucher: voucher };
            });
        } catch (error: any) {
            if (error.payload) throw error;

            logs.error('[VOUCHER FAULT] settleVoucher execution failed', error);
            throw ApiResponse.internalServerError('Unable to complete voucher settlement.');
        }
    }

    /**
    * Ref: Fetch Available Rewards.yml (GET {{baseURL}}{{ApiURL}}/admin/rewards)
    */
    public static async fetchAvailableRewards() {
        try {
            return await prisma.reward.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } catch (error: any) {
            throw ApiResponse.internalServerError('Unable to retrieve available store rewards, an unexpected internal server error occurred.');
        }
    }
}