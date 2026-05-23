import { FastifyRequest, FastifyReply } from 'fastify';
import { Validation } from '../utils/validation';
import { ApiResponse } from '../utils/apiResponse';
import { CustomerService } from '../services/customer';
import { Auth } from '../services/auth';
import { fastify } from '../server';
import { Logger } from '../utils/logger';

const logs = new Logger('CustomerController');

export async function syncLineController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const lineAccessToken: string = Validation.requireAuthHeader(request);
        logs.success('AccessToken: ', lineAccessToken);

        const lineProfile: any = await CustomerService.getLineProfile(lineAccessToken);
        logs.success('Line Profile: ', lineProfile);

        const customer: any = await CustomerService.syncLineProfile(lineProfile);
        logs.success('Customer Data: ', customer);
        const { id, lineId, lineDisplayName } = customer;
        const payload = { id, lineId, lineDisplayName };
        logs.success("Payload: ", payload);

        const accessToken: string = Auth.generateAccessToken(fastify, payload);

        return ApiResponse.success({ data: { customer, accessToken }, msg: 'Sync successfully.' });

    } catch (error: any) {
        return reply.status(error.statusCode).send(error.payload);

    }
} //end

export async function earnPointsController(request: FastifyRequest, reply: FastifyReply) {

} //end

export async function fetchTransactionsController(request: FastifyRequest, reply: FastifyReply) {

} //end

export async function fetchRewardsController(request: FastifyRequest, reply: FastifyReply) {

} //end

export async function redeemRewardController(request: FastifyRequest, reply: FastifyReply) {

} //end