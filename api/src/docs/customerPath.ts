import { EndpointDocFormat } from "../routes/apiDocs";

export const customerPath: Record<string, EndpointDocFormat> = {
    syncLine: {
        name: "Sync LINE",
        method: "GET",
        path: "/customer/sync",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{lineToken}}" }],
        responses: {
            200: {
                success: true,
                msg: "Sync successfully.",
                data: {
                    user: {
                        id: "string (UUID)",
                        createdAt: "Date",
                        lineId: "string",
                        lineDisplayName: "string",
                        linePictureUrl: "string | null",
                        totalPoints: "number"
                    },
                    access_token: "string"
                }
            },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "LINE response : $lineResponse", error_code: "LINE_VALIDATE_FAILED" }
            ],
            500: [
                { success: false, msg: "Unable to get line profile an unexpected internal server error occurred.", error_code: "SERVER_ERROR" },
                { success: false, msg: "Unable to sync with line profile an unexpected internal server error occurred.", error_code: "SERVER_ERROR" },
                { success: false, msg: "Internal server error", error_code: "SERVER_ERROR" }
            ]
        }
    },

    fetchTransactions: {
        name: "Fetch Transactions",
        method: "GET",
        path: "/customer/transactions",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{customerToken}}" }],
        responses: {
            200: {
                success: true,
                msg: "Fetch transactions successfully.",
                transactions: [
                    {
                        id: "string",
                        referenceId: "string",
                        pointsAmount: "number",
                        type: '"EARN" || "REDEEM"',
                        createdAt: "Date",
                        userId: "string"
                    }
                ]
            },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.'", error_code: "INVALID_ACC_TOKEN" }
            ],
            500: [
                { success: false, msg: "Unable to get transactions an unexpected internal server error occurred.", error_code: "SERVER_ERROR" },
                { success: false, msg: "Internal server error", error_code: "SERVER_ERROR" }
            ]
        }
    },

    earnPoints: {
        name: "Earn Points",
        method: "POST",
        path: "/customer/earn-points",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{customerToken}}" }],
        bodyExample: {
            code_string: "PT-eb62eb57bb2a224601a616dc88bf1f20"
        },
        responses: {
            200: {
                success: true,
                msg: "Earn points successfully.",
                data: {
                    transaction: {
                        id: "string",
                        referenceId: "string",
                        pointsAmount: "number",
                        type: "EARN",
                        createdAt: "Date",
                        userId: "string"
                    }
                }
            },
            400: [
                { success: false, msg: "Missing or empty required field: '$field", error_code: "FIELDS_MISSING" },
                { success: false, msg: "This QR point token code has already been claimed.", error_code: "ALREADY_CLAIMED" },
                { success: false, msg: "Request payload body or parameters are missing entirely.", error_code: "FIELDS_MISSING" }
            ],
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" },
                { success: false, msg: "Invalid QR Code or expired.", error_code: "EXPIRED" }
            ],
            404: {
                success: false,
                msg: "QR point token code is invalid or does not exist.",
                error_code: "NOT_FOUND"
            },
            410: {
                success: false,
                msg: "This QR point token code hash expired.",
                error_code: "EXPIRED"
            },
            500: [
                { success: false, msg: "Unable to earn the points an unexpected internal server error occurred.", error_code: "SERVER_ERROR" },
                { success: false, msg: "Internal server error", error_code: "SERVER_ERROR" }
            ]
        }
    },

    fetchRewards: {
        name: "Fetch Rewards",
        method: "GET",
        path: "/customer/rewards",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{customerToken}}" }],
        responses: {
            200: {
                success: true,
                msg: "Fetch available rewards successful.",
                rewards: [
                    {
                        id: "string",
                        rewardName: "string",
                        pointsCost: "number",
                        imageUrl: "string | null",
                        active: true,
                        createdAt: "Date"
                    }
                ]
            },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.'", error_code: "INVALID_ACC_TOKEN" }
            ],
            500: [
                { success: false, msg: "Unable to fetch available rewards profile an unexpected internal server error occurred.", error_code: "SERVER_ERROR" },
                { success: false, msg: "Internal server error", error_code: "SERVER_ERROR" }
            ]
        }
    },

    redemptionReward: {
        name: "Redemption Reward",
        method: "POST",
        path: "/customer/rewards/:reward_id/redeem",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{customerToken}}" }],
        pathParams: [{ name: "reward_id", description: "Target UUID of reward asset being redeemed" }],
        bodyExample: {},
        responses: {
            201: {
                success: true,
                msg: "Voucher created.",
                data: {
                    voucher: {
                        id: "string",
                        createdAt: "Date",
                        userId: "string",
                        expiresAt: "Date | null",
                        status: "VoucherStatus",
                        voucherCode: "string",
                        rewardId: "string",
                        reward: {
                            id: "string",
                            createdAt: "Date",
                            rewardName: "string",
                            pointsCost: "number",
                            imageUrl: "string | null",
                            active: "boolean"
                        }
                    }
                }
            },
            400: {
                success: false,
                msg: "Insufficient point reserves to complete this redemption.",
                error_code: "INSUFFICIENT_POINTS"
            },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            404: [
                { success: false, msg: "Reward item is unavailable or does not exist.", error_code: "REWARD_NOT_FOUND" },
                { success: false, msg: "User profile record not found.", error_code: "USER_NOT_FOUND" }
            ],
            500: [
                { success: false, msg: "Unable to redeem an unexpected internal server error occurred.", error_code: "SERVER_ERROR" },
                { success: false, msg: "Internal server error", error_code: "SERVER_ERROR" }
            ]
        }
    }
};