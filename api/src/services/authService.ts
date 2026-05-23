import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { CONFIG } from '../config/constants';
import { fastify } from '../server';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';

export interface CustomerTokenPayload {
    id: string;
    lineId: string;
    displayName: string;
    pictureUrl: string;
    role: 'customer';
}

export class Auth {
    private static readonly TOKEN_EXPIRY = '7d';

    public static async handleAdminLogin(username: string, passwordRaw: string) {
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
            throw ApiResponse.internalServerError(error.message);
        }
    }

    /**
     * Issue an encrypted JWT Bearer Token string via Fastify Instance Core
     */
    public static generateAccessToken(payload: object): string {
        return fastify.jwt.sign(payload, {
            expiresIn: this.TOKEN_EXPIRY,
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
            throw ApiResponse.fail({ statusCode: 401, msg: "Invalid access token or expires.", error_code: "UNAUTH_ACC_TOKEN" });
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

}