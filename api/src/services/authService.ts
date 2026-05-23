import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';

export interface CustomerTokenPayload {
    id: string;
    lineId: string;
    displayName: string;
    pictureUrl: string;
    role: 'customer';
}

export class Auth {
    private static readonly SALT_ROUNDS = 10;
    private static readonly TOKEN_EXPIRY = '7d';

    /**
     * Issue an encrypted JWT Bearer Token string via Fastify Instance Core
     */
    public static generateAccessToken(fastify: FastifyInstance, payload: object): string {
        return fastify.jwt.sign(payload, {
            expiresIn: this.TOKEN_EXPIRY,
        });
    }// end

    /**
     * Hash a plaintext password value securely before storage insertion
     */
    public static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }// end

    /**
     * Compare an incoming plain password attempt against the encrypted hash record
     */
    public static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }// end

    /**
     * Fastify route middleware helper block using native validation hooks
     */
    // public static createRoleGuard(allowedRoles: ('customer' | 'staff' | 'manager' | 'owner')[]) {
    //     return async (request: FastifyRequest, reply: FastifyReply) => {
    //         try {
    //             // Native Fastify verification: automatically parses header 'Bearer <token>',
    //             // validates signatures against environment keys, checks exp, and assigns request.user
    //             await request.jwtVerify();

    //             // request.user is now safe, fully populated, and strongly typed!
    //             const userRole = request.user.role;

    //             if (!allowedRoles.includes(userRole)) {
    //                 return reply.code(403).send({
    //                     success: false,
    //                     msg: 'Access denied. Insufficient security clearances.'
    //                 });
    //             }
    //         } catch (err: any) {
    //             return reply.code(401).send({
    //                 success: false,
    //                 msg: 'Authentication failed: Invalid, missing, or expired token.',
    //                 error_code: 'INVALID_TOKEN'
    //             });
    //         }
    //     };
    // }
}