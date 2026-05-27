import { FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from '../utils/logger';
import { Validation } from '../utils/validation';
import { OwnerService } from '../services/ownerService';
import { ApiResponse } from '../utils/apiResponse';
import { Auth } from '../services/authService';
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

        logs.info('Admin: ', admin);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: 'Login successfully.',
            data: {
                access_token: accessToken,
            }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }
}//end

export async function adminGetTokenPayload(request: FastifyRequest, reply: FastifyReply) {
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
        return reply.status(error.statusCode).send(error.payload);

    }
}//end

export async function adminGetProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodedPayload = Auth.verifyAndDecodeToken<AdminTokenPayload>(accessToken);
        logs.info('Decode Payload: ', decodedPayload);

        const adminProfile = await prisma.admin.findUnique({
            where: { id: decodedPayload.id },
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

        const res = ApiResponse.success({
            statusCode: 200,
            msg: 'Get profile success.',
            data: { admin: adminProfile }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        logs.error(error);

        return reply.status(error.statusCode).send(error.payload);

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
        return reply.status(error.statusCode).send(error.payload);

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
        return reply.status(error.statusCode).send(error.payload);

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
        return reply.status(error.statusCode).send(error.payload);

    }
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
            msg: `Settled voucher ${voucherCode} successful.`,
            data: cancelledInfo
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

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
        return reply.status(error.statusCode).send(error.payload);

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
        return reply.status(error.statusCode).send(error.payload);

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

        const updatedReward: any = await ManagerService.adjustRewardState(rewardId, active);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Reward ${updatedReward.rewardName} active to ${updatedReward.active} successfully.`,
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }
}//end

export async function listCustomersController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        await Auth.lowestAllowRole({ adminId: decodePayload.id, lowestAllowRole: 'MANAGER' });

        const customers: any = await ManagerService.fetchCustomers();

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Fetch customers successfully.`,
            data: {
                customers: customers
            }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

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

        const customer: any = await ManagerService.adjustCustomerPoints(targetUserId, newPoints);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Customer ${customer} Points adjustment successfully`,
            data: {
                customer: customer
            }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

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

        const admins: any = await OwnerService.fetchAdmins();

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Fetch admins successfully.`,
            data: { admins: admins }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }
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
    const { new_role: newRole }: any = request.body;
    const { admin_id: adminId }: any = request.params;

    try {

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

        const updatedAdmin: any = await OwnerService.resetAdminPassword(targetAdminId, newPassword);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Reset admin ${updatedAdmin.username} password successfully.`,
            data: { updated_admin: updatedAdmin }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

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

        const deletedAdmin: any = await OwnerService.deleteAdmin(targetAdminId);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: `Admin ${deletedAdmin.username} deleted.`,
            data: { deleted_admin: deletedAdmin }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }

}//end