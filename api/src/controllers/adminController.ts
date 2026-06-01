import { FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from '../utils/logger';
import { Validation } from '../utils/validation';
import { OwnerService } from '../services/ownerService';
import { ApiResponse } from '../utils/apiResponse';
import { Auth } from '../services/authService';
import { CONFIG } from '../config/constants';
import { fastify } from '../server';
import { AdminRoles } from '../generated/prisma/enums';
import { StaffService } from '../services/staffService';
import { ManagerService } from '../services/managerService';
import { prisma } from '../config/database';

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
        const refreshToken = Auth.generateRefreshToken();

        // persist refresh token for revocation/validation
        await Auth.saveHashedRefreshToken(id, refreshToken);

        reply.setCookie('ARFT', refreshToken, {
            httpOnly: true,
            secure: CONFIG.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 //30 days in seconds
        });

        logs.info('Admin: ', admin);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: 'Login successfully.',
            data: {
                access_token: accessToken,
                admin: admin
            }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);
    }
}//end

export async function adminRefreshTokenController(request: FastifyRequest, reply: FastifyReply) {
    const plainRefreshToken = request.cookies.ARFT;

    try {

        if (!plainRefreshToken) {
            throw ApiResponse.fail({ statusCode: 400, msg: 'Refresh token required.', error_code: 'MISSING_REFRESH_TOKEN' });
        }

        const adminId = await Auth.verifyRefreshTokenAndGetAdminId(plainRefreshToken);
        logs.info('Decoded refresh token: ', adminId);

        const accessTokenPayload = await prisma.admin.findUnique({ where: { id: adminId }, select: { id: true, role: true, username: true } });

        if (!accessTokenPayload) throw ApiResponse.resourceNotFound({ msg: 'Admin not found', error_code: 'ADMIN_NOT_FOUND' });

        // generate new access token
        const newAccessToken = Auth.generateAccessToken(accessTokenPayload);

        // rotate refresh token: issue new one, save and revoke old
        const newRefreshToken = Auth.generateRefreshToken();
        await Auth.saveHashedRefreshToken(adminId, newRefreshToken);

        reply.setCookie('ARFT', newRefreshToken, {
            httpOnly: true,
            secure: CONFIG.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 // 30 days in seconds
        });

        const res = ApiResponse.success({
            statusCode: 200,
            msg: 'Refresh token accepted.',
            data: { access_token: newAccessToken }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);
    }
}//end

export async function adminGetTokenPayloadController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodedPayload = Auth.verifyAndDecodeToken<AdminTokenPayload>(accessToken);
        logs.info('Decode Payload: ', decodedPayload);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: 'Get token payload success.',
            data: { admin_payload: decodedPayload }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);
    }
}//end

export async function adminGetProfileController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodedPayload = Auth.verifyAndDecodeToken<AdminTokenPayload>(accessToken);
        logs.info('Decode Payload: ', decodedPayload);

        const adminProfile = await Auth.getAdminProfile(decodedPayload.id);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: 'Get profile success.',
            data: { admin: adminProfile }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

export async function generatePointsTokenController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const jsonBody: any = request.body;

        Validation.requiredFields(jsonBody, ['points']);

        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken<AdminTokenPayload>(accessToken);
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
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

export async function queryTargetVoucherController(request: FastifyRequest, reply: FastifyReply) {
    const { voucher_code: voucherCode }: any = request.params;

    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        const admin: any = await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'STAFF' });
        logs.info('Admin: ', admin);

        const voucher = await StaffService.fetchVouchersByCode(voucherCode);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Fetch voucher ${voucherCode} successful.`,
            data: { voucher: voucher }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

export async function settleVoucherController(request: FastifyRequest, reply: FastifyReply) {
    const { voucher_code: voucherCode }: any = request.params;

    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        const admin: any = await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'STAFF' });
        logs.info('Admin: ', admin);

        const settledInfo = await StaffService.settleVoucher(voucherCode);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Settled voucher ${voucherCode} successful.`,
            data: settledInfo
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

export async function isOwnerExistController(request: FastifyRequest, reply: FastifyReply) {
    try {
        await OwnerService.validateOwnerUniqueness('OWNER');

        const res = ApiResponse.success({ statusCode: 200, msg: "There is no owner yet." });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}// end

export async function registerOwnerController(request: FastifyRequest, reply: FastifyReply) {
    const reqBody: any = request.body;

    try {
        Validation.requiredFields(reqBody, ['username', 'firstname', 'lastname', 'password']);

        Validation.length(reqBody.password, { min: 8, max: 50 }, 'Password');

        const owner = { ...reqBody, role: "OWNER" }

        const newOwner = await OwnerService.createAdmin(owner);

        const res = ApiResponse.success({
            statusCode: 201,
            msg: 'Owner created.',
            data: { new_owner: newOwner }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}

export async function fetchRewardsController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'STAFF' });

        const rewards = await StaffService.fetchAvailableRewards();

        const res = ApiResponse.success({
            statusCode: 200,
            msg: 'Fetch rewards successful.',
            data: { rewards: rewards }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

export async function cancelVoucherController(request: FastifyRequest, reply: FastifyReply) {
    const { voucher_code: voucherCode }: any = request.params;

    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        const admin: any = await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'STAFF' });
        logs.info('Admin: ', admin);

        const cancelledInfo = await StaffService.cancelVoucher(voucherCode);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Cancelled voucher ${voucherCode} successful.`,
            data: cancelledInfo
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}

//========= MANAGER

export async function createRewardController(request: FastifyRequest, reply: FastifyReply) {
    const jsonBody: any = request.body;

    try {
        Validation.requiredFields(jsonBody, ["reward_name", "points_cost", "active"]);

        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'MANAGER' });

        const newReward = await ManagerService.createReward(jsonBody);

        const res = ApiResponse.success({
            statusCode: 201,
            msg: 'Reward created.',
            data: { new_reward: newReward }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

export async function deleteRewardController(request: FastifyRequest, reply: FastifyReply) {
    const { reward_id: rewardId }: any = request.params;

    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'MANAGER' });

        const deletedReward = await ManagerService.deleteReward(rewardId);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: 'Reward deleted.',
            data: { deleted_reward: deletedReward }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

export async function adjustRewardStateController(request: FastifyRequest, reply: FastifyReply) {
    const { active }: any = request.body;
    const { reward_id: rewardId }: any = request.params;

    try {
        Validation.requiredFields({ active: active }, ['active']);

        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'MANAGER' });

        const updatedReward = await ManagerService.adjustRewardState(rewardId, active);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Set reward name ${updatedReward.rewardName} active ${updatedReward.active} successful.`,
            data: { updated_reward: updatedReward }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

export async function fetchCustomersController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'MANAGER' });

        const customers = await ManagerService.fetchCustomers();

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Fetch customers successfully.`,
            data: {
                customers: customers
            }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

export async function manualPointsOverrideController(request: FastifyRequest, reply: FastifyReply) {
    const { new_points: newPoints }: any = request.body;
    const { user_id: targetUserId }: any = request.params;

    try {
        Validation.requiredFields({ new_points: newPoints }, ['new_points']);

        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'MANAGER' });

        const customer = await ManagerService.adjustCustomerPoints(targetUserId, newPoints);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Customer ${customer.lineDisplayName} Points adjustment successfully.`,
            data: {
                customer: customer
            }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

//========= OWNER

export async function fetchAdminDirectoryController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload = Auth.verifyAndDecodeToken<AdminTokenPayload>(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        const admin: any = await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'OWNER' });
        logs.info('Admin: ', admin);

        const admins = await OwnerService.fetchAdmins();

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Fetch admins successfully.`,
            data: { admins: admins }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

export async function createAdminController(request: FastifyRequest, reply: FastifyReply) {
    const reqBody: any = request.body;

    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload = Auth.verifyAndDecodeToken<AdminTokenPayload>(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        const admin: any = await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'OWNER' });
        logs.info('Admin: ', admin);

        Validation.requiredFields(reqBody, ['username', 'firstname', 'lastname', 'password', 'role']);

        Validation.length(reqBody.password, { min: 8, max: 50 }, 'Password');

        const newAdmin = await OwnerService.createAdmin(reqBody);

        const res = ApiResponse.success({
            statusCode: 201,
            msg: 'Admin created.',
            data: { new_admin: newAdmin }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

export async function modifyAdminRoleController(request: FastifyRequest, reply: FastifyReply) {
    const { new_role: newRole }: any = request.body;
    const { admin_id: adminId }: any = request.params;

    try {

        Validation.requiredFields({ new_role: newRole }, ['new_role']);

        if (newRole === 'OWNER') {
            throw ApiResponse.fail({
                statusCode: 403,
                msg: 'Changing role to OWNER is not allowed.',
                error_code: 'FORBIDDEN_REQUEST'
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

        const updatedAdmin = await OwnerService.adjustAdminRole(adminId, newRole);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Admin ${admin.username} role changed.`,
            data: { updated_admin: updatedAdmin }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

export async function forcePasswordResetController(request: FastifyRequest, reply: FastifyReply) {
    const { new_password: newPassword }: any = request.body;
    const { admin_id: targetAdminId }: any = request.params;

    try {

        Validation.requiredFields({ new_password: newPassword }, ['new_password']);

        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload = Auth.verifyAndDecodeToken<AdminTokenPayload>(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        const admin: any = await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'OWNER' });
        logs.info('Admin: ', admin);

        const updatedAdmin = await OwnerService.resetAdminPassword(targetAdminId, newPassword);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Reset admin ${updatedAdmin.username} password successfully.`,
            data: { updated_admin: updatedAdmin }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }
}//end

export async function deleteAdminController(request: FastifyRequest, reply: FastifyReply) {
    const { admin_id: targetAdminId }: any = request.params;

    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload = Auth.verifyAndDecodeToken<AdminTokenPayload>(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        const admin: any = await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'OWNER' });
        logs.info('Admin: ', admin);

        const deletedAdmin = await OwnerService.deleteAdmin(targetAdminId);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Admin ${deletedAdmin.username} deleted.`,
            data: { deleted_admin: deletedAdmin }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);
        let serverError = error;
        if (!serverError.payload) serverError = ApiResponse.internalServerError();

        return reply.status(serverError.statusCode).send(serverError.payload);

    }

}//end