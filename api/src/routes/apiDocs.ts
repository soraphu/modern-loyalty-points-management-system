import { FastifyInstance } from "fastify";
import { ApiResponse } from "../utils/apiResponse";
import { CONFIG } from "../config/constants";
import { customerPaths } from "../docs/customerPath.ts";
import { adminPaths } from "../docs/adminPath";

export async function apiDocs(fastify: FastifyInstance) {
    const baseUri = CONFIG.API_PREFIX; // e.g., '/api/v1'

    fastify.get('/', async (request, reply) => {

        const welcomePayload = {
            message: 'Welcome to the Core API Gateway platform.',
            status: 'ONLINE',
            documentation: `${baseUri}/docs`,
            version: '1.0.0'
        };

        const response = ApiResponse.success({
            data: welcomePayload,
            msg: 'API gateway service is operational.'
        });

        return reply.status(response.statusCode).send(response.payload);
    });

    fastify.get(`${baseUri}/docs`, async () => {
        return {
            info: {
                title: '👑 DeePoints Customer Loyalty Core API',
                description: 'Production documentation repository tracking customer point earnings, syncs, and redemptions.',
                version: '1.0.0',
            },
            servers: [{ url: 'http://localhost:3000/api/v1' }],
            components: {
                securitySchemes: {
                    BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
                }
            },
            // ◄── MANUALLY MAP ENDPOINTS ──►
            paths: {
                customerPaths,
                adminPaths
            }
        }//return
    });


}
