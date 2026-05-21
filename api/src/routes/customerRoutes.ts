import { FastifyInstance } from 'fastify';

export async function customerRoutes(fastify: FastifyInstance) {

    fastify.get('/', () => {
        return {
            'msg': 'customer'
        }
    });

}