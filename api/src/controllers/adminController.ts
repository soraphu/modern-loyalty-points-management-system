import { FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from '../utils/logger';
import { Validation } from '../utils/validation';
import { OwnerService } from '../services/ownerService';
import { ApiResponse } from '../utils/apiResponse';
import { Auth } from '../services/authService';
import { AdminRoles } from '../generated/prisma/enums';
import { StaffService } from '../services/staffService';
import { ManagerService } from '../services/managerService';

export interface AdminTokenPayload {
    id: string;
    role: AdminRoles;
    username: string;
}

const logs = new Logger('Admin Controller');

//========= STAFF

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

        const admin: any = await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'STAFF' });
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

export async function fetchRewardsController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'STAFF' });

        const rewards = await StaffService.fetchAvailableRewards();

        const res = ApiResponse.success({
            statusCode: 200,
            msg: 'Fetch rewards success.',
            data: { rewards: rewards }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }
}//end

//========= MANAGER

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

//========= OWNER

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

export async function modifyAdminRoleController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { new_role: newRole }: any = request.body;
        const { admin_id: adminId }: any = request.params;

        Validation.requiredFields({ new_role: newRole }, ['new_role']);

        if (newRole === 'OWNER') {
            throw ApiResponse.fail({
                statusCode: 403,
                msg: 'Changing role to OWNER is not allowed.',
                error_code: 'FORBIDDEN'
            });
        }

        if (newRole != 'STAFF' && newRole != 'MANAGER') {
            throw ApiResponse.fail({
                statusCode: 400,
                msg: 'Invalid role type.',
                error_code: 'BAD_REQUEST'
            });
        }

        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        const admin: any = await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'OWNER' });
        logs.info('Admin: ', admin);

        const updateAdmin = await OwnerService.adjustAdminRole(adminId, newRole);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Admin ${admin.username} role changed.`,
            data: { update_admin: updateAdmin }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }
}//end

export function forcePasswordResetController(request: FastifyRequest, reply: FastifyReply) {

}//end

export function deleteAdminController(request: FastifyRequest, reply: FastifyReply) {

}//end