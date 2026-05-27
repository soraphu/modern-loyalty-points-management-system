import { FastifyRequest } from 'fastify';
import { ApiResponse } from './apiResponse'; // Adjust the import path as needed
import { VoucherStatus } from '../generated/prisma/enums';
import { Auth } from '../services/authService';
import { Logger } from './logger';

const logs = new Logger('Validation');

export class Validation {
    /**
     * Checks if a string or variable is empty, null, undefined, or just whitespace.
     */
    public static isEmpty(value: any): boolean {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string' && value.trim() === '') return true;
        if (Array.isArray(value) && value.length === 0) return true;
        if (typeof value === 'object' && Object.keys(value).length === 0) return true;
        return false;
    }

    public static requiredFields(obj: any, fields: string[]): void {
        if (!obj) {
            throw ApiResponse.requiredFieldsMissing('Request payload body or parameters are missing entirely.');
        }

        for (const field of fields) {
            if (!(field in obj) || this.isEmpty(obj[field])) {
                throw ApiResponse.requiredFieldsMissing(`Missing or empty required field: '${field}'`);
            }
        }
    }

    public static async getValidatedVoucher(tx: any, voucherCode: string) {
        try {
            const voucher = await tx.voucher.findUnique({
                where: { voucherCode: voucherCode },
                include: { reward: true }
            });

            // 1. Existence Guard
            if (!voucher) {
                throw ApiResponse.fail({ statusCode: 404, msg: "Voucher not found.", error_code: 'VOUCHER_NOT_FOUND' });
            }

            // 2. Already Claimed Guard
            if (voucher.status === VoucherStatus.CLAIMED) {
                throw ApiResponse.fail({ statusCode: 400, msg: "Voucher already claimed.", error_code: 'ALREADY_CLAIMED' });
            }

            // 3. Already Cancelled Guard
            if (voucher.status === VoucherStatus.CANCELLED) {
                throw ApiResponse.fail({ statusCode: 400, msg: "Voucher already cancelled.", error_code: 'ALREADY_CANCELLED' });
            }

            // 4. Expiration Guard with AUTOMATIC REFUND 🔄
            if (voucher.status === VoucherStatus.EXPIRED || (voucher.expiresAt && voucher.expiresAt < new Date())) {
                if (voucher.status !== VoucherStatus.EXPIRED) {
                    // Update status to EXPIRED inside the database
                    await tx.voucher.update({
                        where: { voucherCode: voucherCode },
                        data: { status: VoucherStatus.EXPIRED }
                    });

                    // Refund the points back to the user right here!
                    await Auth.returnCustomerPoints(voucher.userId, voucher.reward.pointsCost);
                }

                // Halt execution and return the clean 410 response to the client
                throw ApiResponse.fail({ statusCode: 410, msg: "Voucher expired.", error_code: 'EXPIRED' });
            }

            return voucher;
        } catch (error: any) {
            if (error.payload) throw error;

            logs.error('[VOUCHER FAULT] cancelVoucher execution failed', error);
            throw ApiResponse.internalServerError('Unable to complete voucher validation.');
        }
    }

    /**
     * Inspects a Fastify request to ensure a Bearer Authorization header exists.
     * Throws 401 Unauthorized if missing.
     */
    public static requireAuthHeader(request: FastifyRequest): string {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw ApiResponse.authTokenMissing();
        }

        if (!authHeader.startsWith('Bearer ')) {
            throw ApiResponse.authTokenInvalid();
        }

        // Returns the clean token string in case the controller needs it
        return authHeader.slice(7);
    }

    /**
     * Validates an email format string using a standard regex pattern.
     * Throws 400 Bad Request if invalid.
     */
    public static email(email: string, msg = 'The provided email address format is invalid'): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.isEmpty(email) || !emailRegex.test(email)) {
            throw ApiResponse.fail({ msg, statusCode: 400, error_code: "INVALID_EMAIL_FORMAT" });
        }
    }

    /**
     * Validates string lengths (useful for passwords, pin codes, names).
     * Throws 400 Bad Request if constraints fail.
     */
    public static length(value: string, constraints: { min?: number; max?: number }, fieldName = 'Field'): void {
        const len = (value || '').length;

        if (constraints.min && len < constraints.min) {
            throw ApiResponse.fail({
                msg: `${fieldName} must be at least ${constraints.min} characters long.`,
                statusCode: 400,
                error_code: "INVALID_LENGTH"

            });
        }

        if (constraints.max && len > constraints.max) {
            throw ApiResponse.fail({
                msg: `${fieldName} cannot exceed ${constraints.max} characters.`,
                statusCode: 400,
                error_code: "FORBIDDEN_CHAR"
            });
        }
    }
}