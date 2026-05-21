import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Logger } from './utils/logger';
import { ApiResponse } from './utils/api_response';
import { customerRoutes } from './routes/customerRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { API_CONFIG } from './config/constants';

const serverLog = new Logger('server.ts');

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const fastify = Fastify({
    logger: false
});

export const prisma = new PrismaClient({ adapter });

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

const apiPrefix = API_CONFIG.PREFIX;

const startServer = async () => {
    try {
        // Register Environment Variable Validation First
        await fastify.register(fastifyEnv, fastifyOptions);

        // Register CORS (Adjust origin when deploy frontend app)
        await fastify.register(cors, {
            origin: true,
        });

        await fastify.register(adminRoutes, { prefix: `${apiPrefix}/admin` });
        await fastify.register(customerRoutes, { prefix: `${apiPrefix}/customer` });

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