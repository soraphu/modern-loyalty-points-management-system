import { TransactionType, VoucherStatus } from '../generated/prisma/client';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import crypto from 'crypto';
import { Logger } from '../utils/logger';

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

            const qrCode = await prisma.qrCode.create({
                data: {
                    adminId: adminId,
                    codeString: uniqueCodeString,
                    pointValue: points,
                    used: false,
                    expiresAt: expiresAt
                },
                select: {
                    codeString: true
                }
            });

            return qrCode.codeString;
        } catch (error: any) {
            throw ApiResponse.internalServerError('Unable to generate points token, an unexpected internal server error occurred.');
        }
    }

    /**
     * Ref: Fetch Vouchers.yml (POST {{baseURL}}{{ApiURL}}/admin/vouchers)
     */
    public static async fetchVouchersByCode(voucherId: string) {
        try {
            // Locates vouchers matching the specific code payload, including nested rewards
            return await prisma.voucher.findMany({
                where: {
                    id: voucherId // Assuming code_string is passed as the voucher's UUID lookup parameter
                },
                select: {
                    id: true,
                    userId: true,
                    rewardId: true,
                    status: true,
                    createdAt: true,
                    expiresAt: true,
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

    /**
     * Ref: Redeem Voucher.yml (POST {{baseURL}}{{ApiURL}}/admin/vouchers/:voucher_id/settle)
     */
    public static async settleVoucher(voucherId: string) {
        try {
            // Run an isolated interactive database transaction block to guarantee atomic balance handling
            return await prisma.$transaction(async (tx) => {

                const voucher = await tx.voucher.findUnique({
                    where: { id: voucherId },
                    include: { reward: true }
                });

                if (!voucher) {
                    throw ApiResponse.fail({ statusCode: 404, msg: "Voucher not found.", error_code: 'NOT_FOUND' });
                }

                if (voucher.status === VoucherStatus.CLAIMED) {
                    throw ApiResponse.fail({ statusCode: 400, msg: "Voucher already claimed.", error_code: 'ALREADY_CLAIMED' });
                }

                if (voucher.status === VoucherStatus.EXPIRED || (voucher.expiresAt && voucher.expiresAt < new Date())) {
                    throw ApiResponse.fail({ statusCode: 410, msg: "Voucher expired.", error_code: 'EXPIRED' });
                }

                await tx.voucher.update({
                    where: { id: voucherId },
                    data: { status: VoucherStatus.CLAIMED }
                });

                return await tx.transaction.create({
                    data: {
                        userId: voucher.userId,
                        referenceId: voucher.id, // Links back to the source voucher reference ID
                        pointsAmount: -voucher.reward.pointsCost, // Stored as a negative value since it is a REDEEM action
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
            });
        } catch (error: any) {
            // Ensure that clean, custom validation responses (404, 400, 410) pass straight through to the user
            if (error.payload) {
                throw error;
            }

            throw ApiResponse.internalServerError('Unable to complete voucher settlement, an unexpected internal server error occurred.');
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