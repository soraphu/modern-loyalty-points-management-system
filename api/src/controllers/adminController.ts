import { FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from '../utils/logger';
import { Validation } from '../utils/validation';
import { OwnerService } from '../services/ownerService';
import { ApiResponse } from '../utils/apiResponse';

const logs = new Logger('Admin Controller');

export function adminLoginController(request: FastifyRequest, reply: FastifyReply) {

}//end

export function generatePointsTokenController(request: FastifyRequest, reply: FastifyReply) {

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