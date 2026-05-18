import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const fastify = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty', // Makes your terminal logs beautifully readable
        },
    },
});

export const prisma = new PrismaClient({ adapter });

const environmentSchema = {
    type: 'object',
    required: ['DATABASE_URL', 'PORT'],
    properties: {
        DATABASE_URL: { type: 'string' },
        PORT: { type: 'string', default: '8080' },
    },
};

const fastifyOptions = {
    schema: environmentSchema,
    dotenv: true, // Tells Fastify to read your local .env file
};

const startServer = async () => {
    try {
        // Register Environment Variable Validation First
        await fastify.register(fastifyEnv, fastifyOptions);

        // Register CORS (Adjust origin when you deploy your frontend app)
        await fastify.register(cors, {
            origin: true,
        });

        fastify.get('/health', async (request, reply) => {
            return {
                success: true,
                message: "Fastify + TypeScript server is breathing alive!"
            };
        });

        await prisma.$connect();
        fastify.log.info('Database connected successfully via Prisma 🐘');

        const port = Number(process.env.PORT) || 8080;
        await fastify.listen({ port: port, host: '0.0.0.0' });

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