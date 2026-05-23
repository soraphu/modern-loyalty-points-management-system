import { FastifyRequest, FastifyReply } from 'fastify';
import { Validation } from '../utils/validation';
import { ApiResponse } from '../utils/apiResponse';
import { CustomerService } from '../services/customer';
import { Auth } from '../services/auth';
import { fastify } from '../server';

export async function syncLineController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const lineAccessToken: string = Validation.requireAuthHeader(request);

        const lineProfile: any = await CustomerService.getLineProfile(lineAccessToken);

        const accessToken: string = Auth.generateAccessToken(fastify, lineProfile);

        return ApiResponse.success({ data: accessToken, msg: 'Sync successfully.' });

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