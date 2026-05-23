import { TransactionType, VoucherStatus } from '../generated/prisma/client';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import crypto from 'crypto';

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
            throw error;
        }
    }

    /**
     * Ref: Fetch Vouchers.yml (POST {{baseURL}}{{ApiURL}}/admin/vouchers)
     */
    public static async fetchVouchersByCode(codeString: string) {
        try {
            // Locates vouchers matching the specific code payload, including nested rewards
            return await prisma.voucher.findMany({
                where: {
                    id: codeString // Assuming code_string is passed as the voucher's UUID lookup parameter
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
                            rewardName: true, // 🟢 Correctly mapped from your updated schema field
                            pointsCost: true,
                            imageUrl: true,
                            active: true,
                            createdAt: true
                        }
                    }
                }
            });
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Ref: Redeem Voucher.yml (POST {{baseURL}}{{ApiURL}}/admin/vouchers/:voucher_id/settle)
     */
    public static async redeemVoucher(voucherId: string, codeString: string) {
        try {
            // Run an isolated interactive database transaction block to guarantee atomic balance handling
            return await prisma.$transaction(async (tx) => {

                const voucher = await tx.voucher.findUnique({
                    where: { id: voucherId },
                    include: { reward: true }
                });

                if (!voucher) {
                    throw new Error("VOUCHER_NOT_FOUND");
                }

                if (voucher.status === VoucherStatus.CLAIMED) {
                    throw new Error("VOUCHER_ALREADY_CLAIMED");
                }

                if (voucher.status === VoucherStatus.EXPIRED || (voucher.expiresAt && voucher.expiresAt < new Date())) {
                    throw new Error("VOUCHER_EXPIRED");
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
            if (
                error.message === "VOUCHER_NOT_FOUND" ||
                error.message === "VOUCHER_ALREADY_CLAIMED" ||
                error.message === "VOUCHER_EXPIRED"
            ) {
                throw error; // Let specific business layer violations pass clean up to the controller
            }
            throw ApiResponse.internalServerError(error);
        }
    }

    /**
     * Ref: Fetch Available Rewards.yml (GET {{baseURL}}{{ApiURL}}/admin/rewards)
     */
    public static async fetchAvailableRewards() {
        try {
            return await prisma.reward.findMany({
                where: {
                    active: true // Filters down exclusively to active rewards per documentation specs
                },
                select: {
                    id: true,
                    rewardName: true, // 🟢 Correctly mapped from your updated schema field
                    pointsCost: true,
                    imageUrl: true,
                    active: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } catch (error: any) {
            throw error;
        }
    }
}