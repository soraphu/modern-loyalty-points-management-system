// src/routes/customerRoutes.ts
import { FastifyInstance } from 'fastify';
import {
    syncLineController,
    earnPointsController,
    fetchTransactionsController,
    fetchRewardsController,
    redeemRewardController,
    fetchPendingVouchersController
} from '../controllers/customerController';

export async function customerRoutes(fastify: FastifyInstance) {

    // Sync LINE Account Profile
    // POST -> /api/v1/customer/sync
    fastify.get('/sync', syncLineController);

    // Fetch Point Transaction Ledger History
    // GET -> /api/v1/customer/transactions
    fastify.get('/transactions', fetchTransactionsController);

    // Earn Points via QR String Payload
    // POST -> /api/v1/customer/earn-points
    fastify.post('/earn-points', earnPointsController);

    // Fetch Active Rewards Catalog Marketplace
    // GET -> /api/v1/customer/rewards
    fastify.get('/rewards', fetchRewardsController);

    // Redeem Wallet Point Reserves for a Specific Digital Voucher Block
    // POST -> /api/v1/customer/rewards/:reward_id/redeem
    fastify.post('/rewards/:reward_id/redeem', redeemRewardController);

    fastify.get('/pending-vouchers', fetchPendingVouchersController);
}//end