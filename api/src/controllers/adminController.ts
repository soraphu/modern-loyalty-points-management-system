import { FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from '../utils/logger';
import { Validation } from '../utils/validation';
import { OwnerService } from '../services/ownerService';
import { ApiResponse } from '../utils/apiResponse';
import { Auth } from '../services/authService';
import { AdminRoles } from '../generated/prisma/enums';
import { StaffService } from '../services/staffService';

export interface AdminTokenPayload {
    id: string;
    role: AdminRoles;
    username: string;
}

const logs = new Logger('Admin Controller');

export async function adminLoginController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const reqBody: any = request.body;

        Validation.requiredFields(reqBody, ['username', 'password']);

        const admin: any = await Auth.handleAdminLogin(reqBody.username, reqBody.password);
        const { id, role, username } = admin;
        const JwtPayload: AdminTokenPayload = { id, role, username }

        const accessToken = Auth.generateAccessToken(JwtPayload);

        logs.info('Admin: ', admin);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: 'Login successfully.',
            data: {
                access_token: accessToken,
                admin_data: admin,
            }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }
}//end

export async function generatePointsTokenController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const jsonBody: any = request.body;

        Validation.requiredFields(jsonBody, ['points']);

        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        const admin: any = await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'MANAGER' });
        logs.info('Admin: ', admin);

        const codeString = await StaffService.generatePointsToken(admin.id, jsonBody.points);
        logs.success('Code String: ', codeString);

        const res = ApiResponse.success({
            statusCode: 201,
            msg: 'Generate points token success.',
            data: { code_string: codeString }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }
}//end

export function queryVouchersController(request: FastifyRequest, reply: FastifyReply) {

}//end

export function settleVoucherController(request: FastifyRequest, reply: FastifyReply) {

}//end

export function fetchRewardsController(request: FastifyRequest, reply: FastifyReply) {
}//end

export function createRewardController(request: FastifyRequest, reply: FastifyReply) {

}//end

export function deleteRewardController(request: FastifyRequest, reply: FastifyReply) {

}//end

export function adjustRewardStateController(request: FastifyRequest, reply: FastifyReply) {

}//end

export function listCustomersController(request: FastifyRequest, reply: FastifyReply) {

}//end

export function manualPointsOverrideController(request: FastifyRequest, reply: FastifyReply) {

}//end

export function fetchAdminDirectoryController(request: FastifyRequest, reply: FastifyReply) {

}//end

export async function createAdminController(request: FastifyRequest, reply: FastifyReply) {
    const reqBody: any = request.body;

    try {
        Validation.requiredFields(reqBody, ['username', 'firstname', 'lastname', 'password', 'role']);

        Validation.length(reqBody.password, { min: 8, max: 50 }, 'password');

        const newAdmin = await OwnerService.createAdmin(reqBody);

        const res = ApiResponse.success({
            statusCode: 201,
            msg: 'Admin created.',
            data: newAdmin
        });
        ``
        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }
}//end

export function modifyAdminRoleController(request: FastifyRequest, reply: FastifyReply) {

}//end

export function forcePasswordResetController(request: FastifyRequest, reply: FastifyReply) {

}//end

export function deleteAdminController(request: FastifyRequest, reply: FastifyReply) {

}//end