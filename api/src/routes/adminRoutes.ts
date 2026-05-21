import { FastifyInstance } from 'fastify';

export async function adminRoutes(fastify: FastifyInstance) {
    fastify.get('/', () => {
        return { 'msg': 'admin' }
    });
}
