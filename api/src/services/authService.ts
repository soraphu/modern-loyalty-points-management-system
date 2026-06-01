import bcrypt from 'bcryptjs';
import { CONFIG } from '../config/constants';
import { fastify } from '../server';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { AdminRoles } from '../generated/prisma/enums';
import crypto from 'crypto';
import { Logger } from '../utils/logger';
import { FastifyReply } from 'fastify/types/reply';

export interface CustomerTokenPayload {
    id: string;
    lineId: string;
    displayName: string;
    pictureUrl: string;
    role: 'customer';
}

const logs = new Logger('AuthService');

export class Auth {
    private static readonly ACC_TOKEN_EXPIRY = '15m';
    private static readonly REFRESH_TOKEN_EXPIRY = 30; // in days


    private static generateAlphanumericCode(): string {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let code = '';

        for (let i = 0; i < 6; i++) {
            const randomIndex = crypto.randomInt(0, chars.length);
            code += chars[randomIndex];
        }

        return code;
    }

    public static setRefreshTokenCookie = (reply: FastifyReply, newRefreshToken: string) => {
        reply.setCookie('ARFT', newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 // 30 days in seconds
        });
    }

    public static async returnCustomerPoints(userId: string, pointsAmount: number) {
        try {
            return await prisma.user.update({
                where: { id: userId },
                data: {
                    totalPoints: {
                        increment: pointsAmount
                    }
                },
            });
        } catch (error) {
            throw ApiResponse.internalServerError('Unable to return points an unexpected internal server error occurred.');

        }
    }

    public static async createUniqueVoucher(userId: string, rewardId: string) {
        let uniqueCode = '';
        let isUnique = false;
        let attempts = 0;
        const voucherValidityPeriod = 24;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getHours() + voucherValidityPeriod);
        const maxAttempts = 5;

        while (!isUnique && attempts < maxAttempts) {
            uniqueCode = this.generateAlphanumericCode();
            attempts++;

            // Check if this code already exists in the table
            const existingVoucher = await prisma.voucher.findUnique({
                where: { voucherCode: uniqueCode }
            });

            if (!existingVoucher) {
                isUnique = true;
            }
        }

        if (!isUnique) {
            throw ApiResponse.internalServerError('System temporary congestion: Could not allocate unique token shortcode.');
        }

        // 💾 Safely write to database once confirmed free
        return await prisma.voucher.create({
            data: {
                userId,
                rewardId,
                voucherCode: uniqueCode,
                expiresAt: expiryDate
            },
            select: { reward: true }
        });
    }// end

    public static async handleVerifyAdminLogin(username: string, passwordRaw: string) {
        try {
            // Find the admin by unique username
            const admin = await prisma.admin.findUnique({
                where: { username }
            });

            const loginFailResponse = ApiResponse.fail({
                statusCode: 401,
                msg: "Invalid username or password.",
                error_code: 'INVALID_ACCOUNT'
            });

            // If admin doesn't exist, throw a specific credential error
            if (!admin) {
                throw loginFailResponse;
            }

            const { passwordHashed, ...adminExceptPassword } = admin;

            // Compare incoming raw password string with the database passwordHashed
            const isPasswordValid = await Auth.verifyPassword(passwordRaw, passwordHashed);
            if (!isPasswordValid) {
                throw loginFailResponse;
            }

            // Return the selected fields exactly as expected by Admin Login.yml response design
            return adminExceptPassword;

        } catch (error: any) {
            if (error.payload) {
                throw error;
            }
            throw ApiResponse.internalServerError('Unable to login an unexpected internal server error occurred.');
        }
    }

    /**
     * Issue an encrypted JWT Bearer Token string via Fastify Instance Core
     */
    public static generateAccessToken(payload: object): string {
        return fastify.jwt.sign(payload, {
            expiresIn: this.ACC_TOKEN_EXPIRY,
        });
    }// end

    /**
     * Decodes and verifies an incoming JWT access token.
     * Throws an error if the token is invalid, tampered with, or expired.
     */
    public static verifyAndDecodeToken<T extends object>(token: string): T {
        try {
            return fastify.jwt.verify<T>(token);
        } catch (error: any) {
            throw ApiResponse.authTokenInvalid();
        }
    }// end

    /**
     * Hash a plaintext password value securely before storage insertion
     */
    public static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, CONFIG.SALT_ROUNDS);
    }// end

    /**
     * Compare an incoming plain password attempt against the encrypted hash record
     */
    public static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }// end

    public static async getAdminProfile(adminId: string) {
        try {
            return await prisma.admin.findUnique({
                where: { id: adminId },
                select: {
                    id: true,
                    role: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
        } catch (error) {
            throw ApiResponse.internalServerError('Unable to get admin profile an unexpected internal server error occurred.');

        }
    }// end

    /**
     * Ensures the admin's live role meets or exceeds the required `lowestAllowRole`.
     */
    public static async lowestAllowRole({ adminId, lowestAllowRole }: { adminId: string, lowestAllowRole: AdminRoles }): Promise<any> {
        try {
            // Query the live row configuration from the database using the pre-decoded adminId
            const admin = await prisma.admin.findUnique({
                where: { id: adminId },
                select: {
                    id: true,
                    role: true,
                    username: true,
                    firstname: true,
                    lastname: true
                }
            });

            // Ensure the account still exists in the system rows
            if (!admin) {
                throw ApiResponse.fail({
                    statusCode: 404,
                    msg: "Admin account record not found.",
                    error_code: "ADMIN_NOT_FOUND"
                });
            }

            // Define the hierarchical authority ranks (Higher number = Higher clearance)
            const roleHierarchy: Record<AdminRoles, number> = {
                [AdminRoles.STAFF]: 1,
                [AdminRoles.MANAGER]: 2,
                [AdminRoles.OWNER]: 3
            };

            const adminLiveRank = roleHierarchy[admin.role];
            const requiredRank = roleHierarchy[lowestAllowRole];

            // Check if the current admin's clearance rank meets or exceeds the endpoint minimum
            if (adminLiveRank < requiredRank) {
                throw ApiResponse.fail({
                    statusCode: 403,
                    msg: "You do not have permission to access this resource.",
                    error_code: "FORBIDDEN_ROLE"
                });
            }

            // Return the admin record payload if clearance hierarchy check passes
            return admin;

        } catch (error: any) {
            if (error.payload) {
                throw error;
            }
            throw ApiResponse.internalServerError('Unable to validation role an unexpected internal server error occurred.');
        }
    }

    /**
     * Issue a refresh token with longer expiry
     */
    public static generateRefreshToken(): string {
        return crypto.randomBytes(64).toString('hex');
    }

    /**
     * Verify and decode incoming refresh token
     */
    public static async verifyRefreshTokenAndGetAdminId(plainToken: string): Promise<string> {
        try {
            // 1. Hash the incoming plain token from the client to match your database records
            const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

            // 2. Look up the HASHED token in the database
            const session = await prisma.refreshToken.findUnique({
                where: { hashedToken }
            });

            if (!session) {
                throw ApiResponse.authTokenInvalid();
            }

            // 3. Check expiration
            if (new Date() > session.expiresAt) {
                await prisma.refreshToken.delete({ where: { id: session.id } }).catch(() => { });
                throw ApiResponse.authTokenInvalid();
            }

            return session.adminId;
        } catch (error: any) {
            if (error.statusCode) throw error;
            throw ApiResponse.authTokenInvalid();
        }
    }

    /**
     * Persist a refresh token record to database for future revocation/validation
     */
    public static async saveHashedRefreshToken(adminId: string, token: string) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        try {
            // Derive expiry from token `exp` claim
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY);

            // Use upsert to handle the "Insert or Update" logic seamlessly
            return await prisma.refreshToken.upsert({
                // 1. Where to look for a duplicate condition
                where: {
                    adminId: adminId,
                },
                create: {
                    adminId,
                    hashedToken,
                    expiresAt,
                },
                update: {
                    hashedToken,
                    expiresAt,
                },
            });
        } catch (error) {
            logs.error('Error saving refresh token:', error);
            throw ApiResponse.internalServerError('Unable to save refresh token an unexpected internal server error occurred.');
        }
    }

    public static async revokeRefreshToken(token: string) {
        try {
            return await prisma.refreshToken.update({ where: { hashedToken: token }, data: { revoked: true } });
        } catch (error) {
            throw ApiResponse.internalServerError('Unable to revoke refresh token an unexpected internal server error occurred.');
        }
    }

}//end class