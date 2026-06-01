// src/routes/adminRoutes.ts
import { FastifyInstance } from 'fastify';
import {
    adminLoginController,
    generatePointsTokenController,
    queryTargetVoucherController,
    settleVoucherController,
    fetchRewardsController,
    createRewardController,
    deleteRewardController,
    adjustRewardStateController,
    fetchCustomersController,
    manualPointsOverrideController,
    fetchAdminDirectoryController,
    createAdminController,
    modifyAdminRoleController,
    forcePasswordResetController,
    deleteAdminController,
    cancelVoucherController,
    adminGetProfileController,
    adminGetTokenPayloadController,
    registerOwnerController,
    isOwnerExistController,
    adminRefreshTokenController,
    adminLogoutController
} from '../controllers/adminController';

export async function adminRoutes(fastify: FastifyInstance) {

    // Administrative Personnel Authentication
    // POST -> /api/v1/admin/login
    fastify.post('/register-owner', registerOwnerController);

    fastify.get('/is-owner-exist', isOwnerExistController);

    // POST -> /api/v1/admin/login
    fastify.post('/login', adminLoginController);

    // Exchange refresh token for new access token
    // POST -> /api/v1/admin/refresh
    fastify.get('/auth/refresh', adminRefreshTokenController);

    fastify.post('/logout', adminLogoutController);

    // Get Admin Payload
    fastify.get('/payload', adminGetTokenPayloadController);

    // Get Admin Profile
    fastify.get('/profile', adminGetProfileController);

    // Generate Secure Points Allocation Token
    // POST -> /api/v1/admin/points-token
    fastify.post('/points-token', generatePointsTokenController);

    // Query and Search Customer Target Vouchers
    // GET -> /api/v1/admin/vouchers
    fastify.get('/vouchers/:voucher_code', queryTargetVoucherController);

    // Settle and Redeem Outstanding Voucher
    // PATCH -> /api/v1/admin/vouchers/:voucher_id/settle
    fastify.patch('/vouchers/:voucher_code/settle', settleVoucherController);

    fastify.patch('/vouchers/:voucher_code/cancel', cancelVoucherController);

    // Fetch Complete Available Rewards Listing
    // GET -> /api/v1/admin/rewards
    fastify.get('/rewards', fetchRewardsController);

    // Initialize and Create New Reward Asset Listing
    // POST -> /api/v1/admin/rewards
    fastify.post('/rewards', createRewardController);

    // Hard Purge Reward Listing
    // DELETE -> /api/v1/admin/rewards/:reward_id
    fastify.delete('/rewards/:reward_id', deleteRewardController);

    // Toggle Active Availability State
    // PATCH -> /api/v1/admin/rewards/:reward_id/state-adjustment
    fastify.patch('/rewards/:reward_id/state-adjustment', adjustRewardStateController);

    // List Registered Platform Customers
    // GET -> /api/v1/admin/customers
    fastify.get('/customers', fetchCustomersController);

    // Manual Customer Wallet Balance Override
    // PATCH -> /api/v1/admin/customers/:user_id/points-adjustment
    fastify.patch('/customers/:user_id/points-adjustment', manualPointsOverrideController);

    // Fetch Administrative System Directory
    // GET -> /api/v1/admin/admins
    fastify.get('/admins', fetchAdminDirectoryController);

    // Provision and Create New Administrative Console Account
    // POST -> /api/v1/admin/admins
    fastify.post('/admins', createAdminController);

    // Modify Operations Permission Tier
    // PATCH -> /api/v1/admin/admins/:admin_id/role-adjustment
    fastify.patch('/admins/:admin_id/role-adjustment', modifyAdminRoleController);

    // Force Password Credential Replacement
    // PATCH -> /api/v1/admin/admins/:admin_id/password-reset
    fastify.patch('/admins/:admin_id/password-reset', forcePasswordResetController);

    // Revoke/Delete Administrative Console Account
    // DELETE -> /api/v1/admin/admins/:admin_id
    fastify.delete('/admins/:admin_id', deleteAdminController);
}//end