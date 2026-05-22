import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import fastifyJwt from '@fastify/jwt';
import { Logger } from './utils/logger';
import { ApiResponse } from './utils/apiResponse';
import { customerRoutes } from './routes/customerRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { CONFIG } from './config/constants';
import { apiDocs } from './routes/apiDocs';
import { prisma } from './config/database';

const serverLog = new Logger('server.ts');

export const fastify = Fastify({
    logger: false
});

const environmentSchema = {
    type: 'object',
    required: ['DATABASE_URL', 'PORT'],
    properties: {
        DATABASE_URL: { type: 'string' },
        PORT: { type: 'string', default: 3000 },
    },
};

const fastifyOptions = {
    schema: environmentSchema,
    dotenv: true, // Tells Fastify to read local .env file
};

const apiPrefix = CONFIG.API_PREFIX;

const startServer = async () => {
    try {
        // Register Environment Variable Validation First
        await fastify.register(fastifyEnv, fastifyOptions);

        // Register CORS (Adjust origin when deploy frontend app)
        await fastify.register(cors, {
            origin: true,
        });

        fastify.register(fastifyJwt, {
            secret: CONFIG.JWT_SECRET
        });

        await fastify.register(adminRoutes, { prefix: `${apiPrefix}/admin` });
        await fastify.register(customerRoutes, { prefix: `${apiPrefix}/customer` });
        await fastify.register(apiDocs, { prefix: `/` });

        fastify.get('/health', async (request, reply) => {
            const res = ApiResponse.success({ msg: "Fastify + TypeScript server is breathing alive!" });

            return reply.status(res.statusCode).send(res.payload);
        });

        await prisma.$connect();
        serverLog.success('Database connected successfully via Prisma 🐘');

        const port = Number(process.env.PORT) || 3000;
        const serverUrl = await fastify.listen({ port: port, host: '0.0.0.0' });

        serverLog.info(`Development Running: http://localhost:${port}${apiPrefix}`);
        serverLog.info(`Production Running: ${serverUrl}${apiPrefix}`);

    } catch (err) {
        console.log(err);
        fastify.log.error(err);
        process.exit(1);
    }
};

const gracefulShutdown = async () => {
    fastify.log.info('Shutting down server gracefully...');
    await fastify.close();
    await prisma.$disconnect();
    fastify.log.info('Server and Database disconnected safely.');
    process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Ignite!
startServer();