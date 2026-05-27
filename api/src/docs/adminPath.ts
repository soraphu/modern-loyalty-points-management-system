import { EndpointDocFormat } from "../routes/apiDocs";

export const adminPath: Record<string, EndpointDocFormat> = {
    adminLogin: {
        name: "Admin Login",
        method: "POST",
        path: "/admin/login",
        bodyExample: {
            username: "Josept",
            password: "12345678"
        },
        responses: {
            200: {
                success: true,
                msg: "Login successfully.",
                data: {
                    access_token: "string",
                    admin: {
                        username: "string",
                        id: "string (UUID)",
                        role: "AdminRoles",
                        firstname: "string",
                        lastname: "string",
                        createdAt: "Date",
                        updatedAt: "Date"
                    }
                }
            },
            400: [
                {
                    success: false,
                    msg: "Request payload body or parameters are missing entirely.",
                    error_code: "FIEDS_MISSING" // Preserved original config typo
                },
                {
                    success: false,
                    msg: "Missing or empty required field: '${field}'",
                    error_code: "FIEDS_MISSING"
                }
            ],
            401: {
                success: false,
                msg: "Invalid username or password.",
                error_code: "INVALID_ACCOUNT"
            },
            500: {
                success: false,
                msg: "Unable to login an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    getPayload: {
        name: "Admin Get Token Payload",
        method: "GET",
        path: "/admin/payload",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{staffToken}}" }],
        responses: {
            200: {
                success: true,
                msg: "Get token payload success.",
                data: {
                    admin_payload: { id: "string (UUID)", role: "AdminRoles", username: "string" }
                }
            },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            500: {
                success: false,
                msg: "Unable to login an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    getProfile: {
        name: "Admin Get Profile",
        method: "GET",
        path: "/admin/profile",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{staffToken}}" }],
        responses: {
            200: {
                success: true,
                msg: "Get token payload success.",
                data: {
                    admin: {
                        username: "string",
                        id: "string (UUID)",
                        role: "AdminRoles",
                        firstname: "string",
                        lastname: "string",
                        passwordHashed: "string",
                        createdAt: "Date",
                        updatedAt: "Date"
                    }
                }
            },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            500: {
                success: false,
                msg: "Unable to get admin profile an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    fetchCustomers: {
        name: "Fetch Customers List",
        method: "GET",
        path: "/admin/customers",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{managerToken}}" }],
        responses: {
            200: {
                success: true,
                msg: "Fetch customers successfully.",
                customers: [
                    {
                        id: "string (UUID)",
                        lineId: "string",
                        lineDisplayName: "string",
                        linePictureUrl: "string | null",
                        totalPoints: "number",
                        createdAt: "Date"
                    }
                ]
            },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            500: {
                success: false,
                msg: "Unable to fetch customers an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    createReward: {
        name: "Create Reward Asset",
        method: "POST",
        path: "/admin/rewards",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{managerToken}}" }],
        bodyExample: { reward_name: "TEST_REDEEM", points_cost: 1, active: true, image_url: null },
        responses: {
            201: {
                success: true,
                msg: "Reward created.",
                data: {
                    new_reward: {
                        id: "string (UUID)",
                        createdAt: "Date",
                        rewardName: "string",
                        pointsCost: "number",
                        imageUrl: "string | null",
                        active: "boolean"
                    }
                }
            },
            400: {
                success: false,
                msg: "You do not have permission to access this resource.",
                error_code: "FORBIDDEN_ROLE"
            },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            404: {
                success: false,
                msg: "Admin account record not found.",
                error_code: "ADMIN_NOT_FOUND"
            },
            500: {
                success: false,
                msg: "Unable to create reward an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    deleteReward: {
        name: "Delete Reward Asset",
        method: "DELETE",
        path: "/admin/rewards/:reward_id",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{managerToken}}" }],
        pathParams: [{ name: "reward_id", description: "Target UUID of reward asset being pruned" }],
        responses: {
            200: {
                success: true,
                msg: "Reward deleted.",
                data: {
                    deleted_reward: {
                        id: "string (UUID)",
                        createdAt: "Date",
                        rewardName: "string",
                        pointsCost: "number",
                        imageUrl: "string | null",
                        active: "boolean"
                    }
                }
            },
            400: {
                success: false,
                msg: "You do not have permission to access this resource.",
                error_code: "FORBIDDEN_ROLE"
            },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            404: [
                { success: false, msg: "Admin account record not found.", error_code: "ADMIN_NOT_FOUND" },
                { success: false, msg: "Target reward item not found.", error_code: "NOT_FOUND" }
            ],
            500: {
                success: false,
                msg: "Unable to delete reward an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    editCustomerPoints: {
        name: "Edit Customer Points",
        method: "PATCH",
        path: "/admin/customers/:user_id/points-adjustment",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{managerToken}}" }],
        pathParams: [{ name: "user_id", description: "Target customer unique reference user id" }],
        bodyExample: { new_points: 32 },
        responses: {
            200: {
                success: true,
                msg: "Customer ${customer.lineDisplayName} Points adjustment successfully.",
                data: {
                    customer: {
                        id: "string (UUID)",
                        lineId: "string",
                        lineDisplayName: "string",
                        linePictureUrl: "string | null",
                        totalPoints: "number",
                        createdAt: "Date"
                    }
                }
            },
            400: [
                { success: false, msg: "Request payload body or parameters are missing entirely.", error_code: "FIEDS_MISSING" },
                { success: false, msg: "Missing or empty required field: '${field}'", error_code: "FIEDS_MISSING" },
                { success: false, msg: "You do not have permission to access this resource.", error_code: "FORBIDDEN_ROLE" },
                { success: false, msg: "Invalid points numerical assignment value provided.", error_code: "INVALID_POINTS_VALUE" }
            ],
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            404: [
                { success: false, msg: "Customer account context profile not found.", error_code: "CUSTOMER_NOT_FOUND" },
                { success: false, msg: "Admin account record not found.", error_code: "ADMIN_NOT_FOUND" }
            ],
            500: {
                success: false,
                msg: "Unable adjust customer points an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    editRewardStatus: {
        name: "Edit Reward Visibility State",
        method: "PATCH",
        path: "/admin/rewards/:reward_id/state-adjustment",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{managerToken}}" }],
        pathParams: [{ name: "reward_id", description: "Unique target identifier tracking target reward item" }],
        bodyExample: { active: false },
        responses: {
            200: {
                success: true,
                msg: "Set reward name ${updatedReward.rewardName} active ${updatedReward.active} successful.",
                data: {
                    updated_reward: {
                        id: "string (UUID)",
                        createdAt: "Date",
                        rewardName: "string",
                        pointsCost: "number",
                        imageUrl: "string | null",
                        active: "boolean"
                    }
                }
            },
            400: [
                { success: false, msg: "Request payload body or parameters are missing entirely.", error_code: "FIEDS_MISSING" },
                { success: false, msg: "Missing or empty required field: '${field}'", error_code: "FIEDS_MISSING" },
                { success: false, msg: "You do not have permission to access this resource.", error_code: "FORBIDDEN_ROLE" }
            ],
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            404: [
                { success: false, msg: "Customer account context profile not found.", error_code: "CUSTOMER_NOT_FOUND" },
                { success: false, msg: "Admin account record not found.", error_code: "ADMIN_NOT_FOUND" }
            ],
            500: {
                success: false,
                msg: "Unable to adjust reward state an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    editAdminRole: {
        name: "Edit Admin Account Role",
        method: "PATCH",
        path: "/admin/admins/:admin_id",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{ownerToken}}" }],
        pathParams: [{ name: "admin_id", description: "Target administrative user profile to alter" }],
        bodyExample: { new_role: "STAFF" },
        responses: {
            200: {
                success: true,
                msg: "Admin ${admin.username} role changed.",
                data: { updated_admin: { id: "string (UUID)", username: "string", role: "AdminRoles" } }
            },
            400: [
                { success: false, msg: "Invalid role type.", error_code: "INVALID_TYPE" },
                { success: false, msg: "You do not have permission to access this resource.", error_code: "FORBIDDEN_ROLE" }
            ],
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            403: {
                success: false,
                msg: "Changing role to OWNER is not allowed.",
                error_code: "FORBIDDEN_REQUEST"
            },
            404: {
                success: false,
                msg: "Admin account record not found.",
                error_code: "ADMIN_NOT_FOUND"
            },
            500: {
                success: false,
                msg: "Unable to adjust role an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    createAdmin: {
        name: "Create Admin Member",
        method: "POST",
        path: "/admin/admins",
        headers: [{ name: "Authorization", required: true, description: "Bearer $access_token" }],
        bodyExample: { role: "MANAGER", username: "WWs", firstname: "Soraphu", lastname: "Thongjun", password: "12345678" },
        responses: {
            201: {
                success: true,
                msg: "Admin created.",
                data: {
                    new_admin: {
                        id: "string (UUID)",
                        role: "AdminRoles",
                        username: "string",
                        firstname: "string",
                        lastname: "string",
                        createdAt: "Date",
                        updatedAt: "Date"
                    }
                }
            },
            400: [
                { success: false, msg: "Request payload body or parameters are missing entirely.", error_code: "FIEDS_MISSING" },
                { success: false, msg: "Missing or empty required field: '${field}'", error_code: "FIEDS_MISSING" },
                { success: false, msg: "Password must be at least 8 characters long.", error_code: "INVALID_LENGTH" },
                { success: false, msg: "Password cannot exceed 50 characters.", error_code: "FORBIDDEN_CHAR" }
            ],
            409: {
                success: false,
                msg: "Owner account already exist.",
                error_code: "OWNER_ALREADY_EXIST"
            },
            500: {
                success: false,
                msg: "Unable to create admin an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    resetAdminPassword: {
        name: "Reset Admin Password",
        method: "PATCH",
        path: "/admin/admins/:admin_id/password-reset",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{ownerToken}}" }],
        pathParams: [{ name: "admin_id", description: "Target ID of the administrative user account" }],
        bodyExample: { new_password: "12345678" },
        responses: {
            200: {
                success: true,
                msg: "Reset admin ${updatedAdmin.username} password successfully.",
                data: {
                    updated_admin: {
                        id: "string (UUID)",
                        username: "string",
                        role: "AdminRoles",
                        firstname: "string",
                        lastname: "string",
                        updatedAt: "Date"
                    }
                }
            },
            400: [
                { success: false, msg: "Request payload body or parameters are missing entirely.", error_code: "FIEDS_MISSING" },
                { success: false, msg: "Missing or empty required field: '${field}'", error_code: "FIEDS_MISSING" },
                { success: false, msg: "You do not have permission to access this resource.", error_code: "FORBIDDEN_ROLE" }
            ],
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            404: {
                success: false,
                msg: "Admin account record not found.",
                error_code: "ADMIN_NOT_FOUND"
            },
            500: {
                success: false,
                msg: "Unable to reset admin password an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    deleteAdmin: {
        name: "Delete Admin",
        method: "DELETE",
        path: "/admin/admins/:admin_id",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{ownerToken}}" }],
        pathParams: [{ name: "admin_id", description: "Target identity key of administrative account" }],
        responses: {
            200: {
                success: true,
                msg: "Admin ${deletedAdmin.username} deleted.",
                data: {
                    deleted_admin: { id: "string (UUID)", username: "string", role: "AdminRoles", firstname: "string", lastname: "string" }
                }
            },
            400: {
                success: false,
                msg: "You do not have permission to access this resource.",
                error_code: "FORBIDDEN_ROLE"
            },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            404: {
                success: false,
                msg: "Admin account record not found.",
                error_code: "ADMIN_NOT_FOUND"
            },
            500: {
                success: false,
                msg: "Unable to delete admin account an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    fetchAdmins: {
        name: "Fetch Admins",
        method: "GET",
        path: "/admin/admins",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{ownerToken}}" }],
        responses: {
            200: {
                success: true,
                msg: "Fetch admins successfully.",
                admins: [
                    {
                        username: "string",
                        id: "string (UUID)",
                        role: "AdminRoles",
                        firstname: "string",
                        lastname: "string",
                        createdAt: "Date",
                        updatedAt: "Date"
                    }
                ]
            },
            400: {
                success: false,
                msg: "You do not have permission to access this resource.",
                error_code: "FORBIDDEN_ROLE"
            },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            404: {
                success: false,
                msg: "Admin account record not found.",
                error_code: "ADMIN_NOT_FOUND"
            },
            500: {
                success: false,
                msg: "Unable to fetch admins an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    settleVoucher: {
        name: "Settle Voucher",
        method: "PATCH",
        path: "/admin/vouchers/:voucher_code/settle",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{staffToken}}" }],
        pathParams: [{ name: "voucher_code", description: "Alpha-numeric voucher identity tracking string" }],
        responses: {
            200: {
                success: true,
                msg: "Settled voucher ${voucherCode} successful.",
                data: {
                    transaction: { id: "string (UUID)", createdAt: "Date", userId: "string (UUID)", referenceId: "string (UUID)", pointsAmount: "number", type: "TransactionType" },
                    settled_voucher: {
                        id: "string (UUID)",
                        createdAt: "Date",
                        userId: "string (UUID)",
                        voucherCode: "string",
                        rewardId: "string (UUID)",
                        status: "VoucherStatus",
                        expiresAt: "Date | null",
                        reward: { id: "string (UUID)", createdAt: "Date", rewardName: "string", pointsCost: "number", imageUrl: "string | null", active: "boolean" }
                    }
                }
            },
            400: { success: false, msg: "Voucher already claimed.", error_code: "ALREADY_CLAIMED" },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            404: [
                { success: false, msg: "Admin account record not found.", error_code: "ADMIN_NOT_FOUND" },
                { success: false, msg: "Voucher not found.", error_code: "VOUCHER_NOT_FOUND" }
            ],
            10: { success: false, msg: "Voucher expired.", error_code: "EXPIRED" },
            500: [
                { success: false, msg: "Unable to complete voucher validation.", error_code: "SERVER_ERROR" },
                { success: false, msg: "Unable to complete voucher settlement.", error_code: "SERVER_ERROR" },
                { success: false, msg: "Internal server error", error_code: "SERVER_ERROR" }
            ]
        }
    },

    cancelVoucher: {
        name: "Cancel Voucher",
        method: "PATCH",
        path: "/admin/vouchers/:voucher_code/cancel",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{staffToken}}" }],
        pathParams: [{ name: "voucher_code", description: "Target alphanumeric shortcode identifier seq" }],
        responses: {
            200: {
                success: true,
                msg: "Cancelled voucher ${voucherCode} successful.",
                data: {
                    cancelled_voucher: {
                        id: "string (UUID)",
                        createdAt: "Date",
                        userId: "string (UUID)",
                        voucherCode: "string",
                        rewardId: "string (UUID)",
                        status: "VoucherStatus",
                        expiresAt: "Date | null",
                        reward: { id: "string (UUID)", createdAt: "Date", rewardName: "string", pointsCost: "number", imageUrl: "string | null", active: "boolean" }
                    },
                    return_points: { userId: "string (UUID)", returnPoints: "number" }
                }
            },
            400: [
                { success: false, msg: "Voucher already claimed.", error_code: "ALREADY_CLAIMED" },
                { success: false, msg: "Voucher already...", error_code: "ALREADY_CLAIMED" }
            ],
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            404: [
                { success: false, msg: "Admin account record not found.", error_code: "ADMIN_NOT_FOUND" },
                { success: false, msg: "Voucher not found.", error_code: "VOUCHER_NOT_FOUND" }
            ],
            410: { success: false, msg: "Voucher expired.", error_code: "EXPIRED" },
            500: [
                { success: false, msg: "Unable to complete voucher validation.", error_code: "SERVER_ERROR" },
                { success: false, msg: "Unable to complete voucher cancellation.", error_code: "SERVER_ERROR" },
                { success: false, msg: "Unable to return points an unexpected internal server error occurred.", error_code: "SERVER_ERROR" },
                { success: false, msg: "Internal server error", error_code: "SERVER_ERROR" }
            ]
        }
    },

    fetchAvailableRewards: {
        name: "Fetch Available Rewards",
        method: "GET",
        path: "/admin/rewards",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{staffToken}}" }],
        responses: {
            200: {
                success: true,
                msg: "Fetch rewards successful.",
                rewards: [
                    { id: "string (UUID)", rewardName: "string", pointsCost: "number", imageUrl: "string | null", active: "boolean", createdAt: "Date" }
                ]
            },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            404: { success: false, msg: "Admin account record not found.", error_code: "ADMIN_NOT_FOUND" },
            500: [
                { success: false, msg: "Unable to validation role an unexpected internal server error occurred.", error_code: "SERVER_ERROR" },
                { success: false, msg: "Unable to retrieve available store rewards, an unexpected internal server error occurred.", error_code: "SERVER_ERROR" },
                { success: false, msg: "Internal server error", error_code: "SERVER_ERROR" }
            ]
        }
    },

    fetchTargetVouchers: {
        name: "Fetch Target Vouchers",
        method: "GET",
        path: "/admin/vouchers/:voucher_code",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{staffToken}}" }],
        pathParams: [{ name: "voucher_code", description: "Target unique code sequence tracking token" }],
        responses: {
            200: {
                success: true,
                msg: "Fetch voucher $voucherCode sucessful.",
                data: {
                    voucher: {
                        id: "string (UUID)",
                        userId: "string (UUID)",
                        rewardId: "string (UUID)",
                        status: "VoucherStatus",
                        createdAt: "Date",
                        expiresAt: "Date",
                        user: { id: "string (UUID)", lineId: "string", lineDisplayName: "string", linePictureUrl: "string" },
                        reward: { id: "string (UUID)", rewardName: "string", pointsCost: "number", imageUrl: "string | null", active: "boolean", createdAt: "Date" }
                    }
                }
            },
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            404: { success: false, msg: "Admin account record not found.", error_code: "ADMIN_NOT_FOUND" },
            500: {
                success: false,
                msg: "Unable to fetch vouchers data records, an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    },

    genPointsToken: {
        name: "Gen Points Token",
        method: "POST",
        path: "/admin/points-token",
        headers: [{ name: "Authorization", required: true, description: "Bearer {{ownerToken}}" }],
        bodyExample: { points: 5 },
        responses: {
            201: { success: true, msg: "Generate points token success.", data: { code_string: "string" } },
            400: [
                { success: false, msg: "Request payload body or parameters are missing entirely.", error_code: "FIEDS_MISSING" },
                { success: false, msg: "Missing or empty required field: '${field}'", error_code: "FIEDS_MISSING" }
            ],
            401: [
                { success: false, msg: "Access token missing.", error_code: "ACC_TOKEN_MISSING" },
                { success: false, msg: "Invalid or expires access token.", error_code: "INVALID_ACC_TOKEN" }
            ],
            404: { success: false, msg: "Admin account record not found.", error_code: "ADMIN_NOT_FOUND" },
            500: {
                success: false,
                msg: "Unable to generate points token, an unexpected internal server error occurred. / Internal server error",
                error_code: "SERVER_ERROR"
            }
        }
    }
};