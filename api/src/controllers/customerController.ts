import { FastifyRequest, FastifyReply } from 'fastify';
import { Validation } from '../utils/validation';
import { ApiResponse } from '../utils/apiResponse';
import { CustomerService } from '../services/customerService';
import { Auth } from '../services/authService';
import { Logger } from '../utils/logger';

const logs = new Logger('CustomerController');

interface CustomerPayload {
    id: string;
    lineId: string;
    lineDisplayName: string;
}

export async function syncLineController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const lineAccessToken: string = Validation.requireAuthHeader(request);
        logs.success('AccessToken: ', lineAccessToken);

        const lineProfile: any = await CustomerService.getLineProfile(lineAccessToken);
        logs.success('Line Profile: ', lineProfile);

        const customer: any = await CustomerService.syncLineProfile(lineProfile);
        logs.success('Customer Data: ', customer);

        const { id, lineId, lineDisplayName } = customer;
        const JwtPayload: CustomerPayload = { id, lineId, lineDisplayName };
        logs.success("Payload: ", JwtPayload);

        const accessToken: string = Auth.generateAccessToken(JwtPayload);

        const res = ApiResponse.success({ data: { user: customer, access_token: accessToken }, msg: 'Sync successfully.' });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }
} //end

export async function earnPointsController(request: FastifyRequest, reply: FastifyReply) {
    const jsonBody: any = request.body;

    try {
        const accessToken: string = Validation.requireAuthHeader(request);
        logs.success('AccessToken: ', accessToken);

        const decodePayload = Auth.verifyAndDecodeToken<CustomerPayload>(accessToken);

        Validation.requiredFields(jsonBody, ['code_string']);

        const updatedData = await CustomerService.earnPoints(decodePayload.id, jsonBody.code_string);

        const res = ApiResponse.success({ data: { update_info: updatedData }, msg: 'Earn points successfully.' });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }
} //end

export async function fetchTransactionsController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload = Auth.verifyAndDecodeToken<CustomerPayload>(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        const customerTransactions = await CustomerService.fetchCustomerTransactions(decodePayload.id);

        const res = ApiResponse.success({
            statusCode: 200,
            msg: 'Fetch transactions successfully.',
            data: { transactions: customerTransactions }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }
} //end

export async function fetchRewardsController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload: any = Auth.verifyAndDecodeToken(accessToken);
        logs.info('Decode Payload: ', decodePayload);

        const rewards = await CustomerService.fetchAvailableRewards();

        const res = ApiResponse.success({
            statusCode: 200,
            msg: 'Fetch available rewards success.',
            data: { rewards: rewards }
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }
} //end

export async function redeemRewardController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { reward_id: rewardId }: any = request.params;

        const accessToken = Validation.requireAuthHeader(request);

        const decodePayload = Auth.verifyAndDecodeToken<CustomerPayload>(accessToken);

        const voucher = await CustomerService.redeemReward(decodePayload.id, rewardId);

        const res = ApiResponse.success({
            statusCode: 201,
            msg: 'Voucher created.',
            data: voucher
        });

        return reply.status(res.statusCode).send(res.payload);
    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }// end

} //end