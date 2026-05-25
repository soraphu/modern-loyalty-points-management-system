import { prisma } from '../config/database'; // Adjust path to your Prisma instance config
import { ApiResponse } from '../utils/apiResponse'; // Adjust path to your custom global API response utility

export class ManagerService {

    /**
     * 1. Create a brand new reward item for the storefront loyalty campaign.
     * Matches configuration schema from: Create Rewards.yml
     */
    public static async createReward(data: {
        reward_name: string;
        points_cost: number;
        active: boolean;
        image_url?: string | null;
    }) {
        try {
            return await prisma.reward.create({
                data: {
                    rewardName: data.reward_name,
                    pointsCost: data.points_cost,
                    active: data.active,
                    imageUrl: data.image_url ?? null
                },
                select: {
                    id: true,
                    rewardName: true,
                    pointsCost: true,
                    imageUrl: true,
                    active: true,
                    createdAt: true
                }
            });
        } catch (error: any) {
            throw ApiResponse.internalServerError(error.message);
        }
    }

    /**
     * 2. Delete an existing reward from the system structurally.
     * Matches configuration schema from: Delete Reward.yml
     */
    public static async deleteReward(rewardId: string) {
        try {
            // Verify structural existence before attempting deletion execution
            const rewardExists = await prisma.reward.findUnique({
                where: { id: rewardId }
            });

            if (!rewardExists) {
                throw ApiResponse.fail({
                    statusCode: 404,
                    msg: "Target reward item not found.",
                    error_code: "NOT_FOUND"
                });
            }

            return await prisma.reward.delete({
                where: { id: rewardId },
                select: {
                    id: true,
                    name: true,
                    pointsCost: true,
                    imageUrl: true,
                    active: true,
                    createdAt: true
                }
            });
        } catch (error: any) {
            if (error.payload) throw error;
            throw ApiResponse.internalServerError(error.message);
        }
    }

    /**
     * 3. Set or overwrite a target customer's cumulative total points.
     * Matches configuration schema from: Edit Customer Points.yml
     */
    public static async adjustCustomerPoints(userId: string, newPoints: number) {
        try {
            if (newPoints === undefined || newPoints < 0) {
                throw ApiResponse.fail({
                    statusCode: 400,
                    msg: "Invalid points numerical assignment value provided.",
                    error_code: "INVALID_POINTS_VALUE"
                });
            }

            // Perform check to grab customer context information
            const customer = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!customer) {
                throw ApiResponse.fail({
                    statusCode: 404,
                    msg: "Customer account context profile not found.",
                    error_code: "CUSTOMER_NOT_FOUND"
                });
            }

            // Update the record total inside the database layer context mapping
            await prisma.user.update({
                where: { id: userId },
                data: { totalPoints: newPoints }
            });

            return {
                success: true,
                msg: `Customer ${customer.lineDisplayName || 'User'} Points adjustment successfully.`
            };
        } catch (error: any) {
            if (error.payload) throw error;
            throw ApiResponse.internalServerError(error.message);
        }
    }

    /**
     * 4. Toggle the active visibility state indicator for store inventory filters.
     * Matches configuration schema from: Edit Reward Status.yml
     */
    public static async adjustRewardState(rewardId: string, active: boolean) {
        try {
            if (active === undefined) {
                throw ApiResponse.fail({
                    statusCode: 400,
                    msg: "Required validation structural flag 'active' missing.",
                    error_code: "FIELDS_MISSING"
                });
            }

            const updatedReward = await prisma.reward.update({
                where: { id: rewardId },
                data: { active: active },
                select: { name: true, active: true }
            });

            return {
                success: true,
                msg: `Rewards ${updatedReward.name} active ${updatedReward.active}.`
            };
        } catch (error: any) {
            // Prisma error target exception routing verification rule structure maps here
            if (error.code === 'P2025') {
                throw ApiResponse.fail({
                    statusCode: 404,
                    msg: "Target reward matching that tracking identifier not found.",
                    error_code: "NOT_FOUND"
                });
            }
            if (error.payload) throw error;
            throw ApiResponse.internalServerError(error.message);
        }
    }

    /**
     * 5. Fetch a list of all customers mapped via the LINE ecosystem channel data records.
     * Matches configuration schema from: Fetch Customers.yml
     */
    public static async fetchCustomers() {
        try {
            const customersList = await prisma.user.findMany({
                select: {
                    id: true,
                    lineId: true,           // Prisma standard camelCase mapping rules
                    lineDisplayName: true,  // Maps back to snake_case elements in API response layout
                    linePictureUrl: true,
                    totalPoints: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            // Re-map dataset structures elegantly to directly match the API spec layout contracts
            const formattedCustomers = customersList.map(cust => ({
                id: cust.id,
                line_id: cust.lineId,
                line_display_name: cust.lineDisplayName,
                line_picture_url: cust.linePictureUrl,
                total_points: cust.totalPoints,
                created_at: cust.createdAt
            }));

            return {
                success: true,
                msg: "Fetch customers successfully.",
                customers: formattedCustomers
            };
        } catch (error: any) {
            if (error.payload) throw error;
            throw ApiResponse.internalServerError(error.message);
        }
    }
}