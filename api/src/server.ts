import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import { Logger } from './utils/logger';
import { ApiResponse } from './utils/apiResponse';
import { customerRoutes } from './routes/customerRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { CONFIG } from './config/constants';
import { apiDocs } from './routes/apiDocs';
import { prisma } from './config/database';
import fastifyCors from '@fastify/cors';

const serverLog = new Logger('server.ts');

export const fastify = Fastify({
    logger: false,
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

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174'
];

const apiPrefix = CONFIG.API_PREFIX;

const startServer = async () => {
    try {
        fastify.register(fastifyCors, {
            // Configures the dynamic origin check logic
            origin: (origin, cb) => {
                // Allow requests with no origin (like mobile apps, curl, or Postman)
                if (!origin) {
                    cb(null, true);
                    return;
                }

                if (allowedOrigins.includes(origin)) {
                    // Origin matches our whitelist layout
                    cb(null, true);
                } else {
                    // Reject origin with a security error
                    cb(new Error('Not allowed by CORS policy'), false);
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],

            // CRITICAL: Must include 'authorization' to allow your Axios Interceptor token through
            allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
            credentials: true, // Allows cross-origin cookies or auth headers to pass
        });

        // Register Environment Variable Validation First
        await fastify.register(fastifyEnv, fastifyOptions);

        fastify.register(fastifyJwt, {
            secret: CONFIG.JWT_SECRET
        });

        // register cookie support for HttpOnly refresh tokens
        await fastify.register(fastifyCookie);

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