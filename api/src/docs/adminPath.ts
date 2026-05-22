export const adminPaths = {
    '/admin/login': {
        post: {
            summary: 'Administrative Personnel Authentication',
            description: 'Validates staff or manager security credentials to grant systems operation console sessions.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['username', 'password'],
                            properties: {
                                username: { type: 'string', example: 'root_admin' },
                                password: { type: 'string', example: 'SecretPassword123!' }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Identity authenticated and console access granted.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Login successfully.' },
                                    admin: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string', example: 'adm_1' },
                                            role: { type: 'string', example: 'manager' },
                                            username: { type: 'string', example: 'root_admin' },
                                            firstname: { type: 'string', example: 'Alex' },
                                            lastname: { type: 'string', example: 'S' },
                                            created_at: { type: 'string', example: '2026-01-01T00:00:00Z' },
                                            updated_at: { type: 'string', example: '2026-01-01T00:00:00Z' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/points-token': {
        post: {
            summary: 'Generate Secure Points Allocation Token',
            description: 'Mints an encrypted string token representing a pre-defined balance of loyalty points for customer ingestion.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['points'],
                            properties: {
                                points: { type: 'number', example: 100 }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Points verification code string minted successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Points token created.' },
                                    code_string: { type: 'string', example: 'tok_pts_9934x8a2' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/vouchers': {
        post: {
            summary: 'Query and Search Customer Vouchers',
            description: 'Retrieves voucher data records matches filtered by specific identifier strings.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['code_string'],
                            properties: {
                                code_string: { type: 'string', example: 'vch_matcha_7721' }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Matching customer voucher collection returned successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Fetch vouchers sucessfully.' },
                                    vouchers: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string', example: 'vch_001' },
                                                user_id: { type: 'string', example: 'usr_1' },
                                                reward_id: { type: 'string', example: 'rwd_0020' },
                                                status: { type: 'string', enum: ['PENDING', 'CLAIMED', 'EXPIRED'], example: 'PENDING' },
                                                created_at: { type: 'string', example: '2026-05-22T04:00:00Z' },
                                                expires_at: { type: 'string', example: '2026-06-22T04:00:00Z' },
                                                reward: {
                                                    type: 'object',
                                                    properties: {
                                                        id: { type: 'string', example: 'rwd_0020' },
                                                        name: { type: 'string', example: 'Premium Matcha Latte' },
                                                        points_cost: { type: 'number', example: 150 },
                                                        image_url: { type: 'string', example: 'https://cdn.deepoints.com/matcha.png' },
                                                        active: { type: 'boolean', example: true },
                                                        created_at: { type: 'string', example: '2026-05-22T04:00:00Z' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/vouchers/{voucher_id}/settle': {
        post: {
            summary: 'Settle and Redeem Outstanding Voucher',
            description: 'Processes operational settlement to permanently transition a customer voucher into utilized state.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            parameters: [{ name: 'voucher_id', in: 'path', required: true, schema: { type: 'string' }, example: 'vch_001' }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['code_string'],
                            properties: {
                                code_string: { type: 'string', example: 'vch_matcha_7721' }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Voucher settled, recording programmatic ledger transaction entries.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Redemption ID rdp_8821 sucessfully.' },
                                    transactions: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string', example: 'tx_9981' },
                                            user_id: { type: 'string', example: 'usr_1' },
                                            reference_id: { type: 'string', example: 'rdp_8821' },
                                            points_amount: { type: 'number', example: 150 },
                                            type: { type: 'string', example: 'REDEEM' },
                                            created_at: { type: 'string', example: '2026-05-22T04:05:00Z' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/rewards': {
        get: {
            summary: 'Fetch Complete Available Rewards Listing',
            description: 'Fetches absolute reward catalog entries containing full parameter specifications configurations.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            responses: {
                200: {
                    description: 'Full baseline rewards configuration array compiled.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Fetch available rewards sucessfully.' },
                                    rewards: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string', example: 'rwd_0020' },
                                                name: { type: 'string', example: 'Premium Matcha Latte' },
                                                points_cost: { type: 'number', example: 150 },
                                                image_url: { type: 'string', example: 'https://cdn.deepoints.com/matcha.png' },
                                                active: { type: 'boolean', example: true },
                                                created_at: { type: 'string', example: '2026-05-22T04:00:00Z' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        post: {
            summary: 'Create Reward Configuration',
            description: 'Establishes a new baseline reward parameter specification inside the centralized catalog database.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['id', 'name', 'points_cost', 'active'],
                            properties: {
                                id: { type: 'string', example: 'rwd_0020' },
                                name: { type: 'string', example: 'Premium Matcha Latte' },
                                points_cost: { type: 'number', example: 150 },
                                active: { type: 'boolean', example: true },
                                created_at: { type: 'string', example: '2026-05-22T04:00:00Z' }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Reward schema initialized successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Reward created.' },
                                    new_reward: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string', example: 'rwd_0020' },
                                            name: { type: 'string', example: 'Premium Matcha Latte' },
                                            points_cost: { type: 'number', example: 150 },
                                            image_url: { type: 'string', example: 'https://cdn.deepoints.com/matcha.png' },
                                            active: { type: 'boolean', example: true },
                                            created_at: { type: 'string', example: '2026-05-22T04:00:00Z' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/rewards/{reward_id}': {
        delete: {
            summary: 'Hard Purge Reward Listing',
            description: 'Removes a specific reward configuration contract record from database registers.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'rwd_0020' }],
            responses: {
                200: {
                    description: 'Record systematically purged.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Reward deleted.' },
                                    removed_reward: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string', example: 'rwd_0020' },
                                            name: { type: 'string', example: 'Premium Matcha Latte' },
                                            points_cost: { type: 'number', example: 150 },
                                            image_url: { type: 'string', example: 'https://cdn.deepoints.com/matcha.png' },
                                            active: { type: 'boolean', example: true },
                                            created_at: { type: 'string', example: '2026-05-22T04:00:00Z' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/rewards/{reward_id}/state-adjustment': {
        patch: {
            summary: 'Toggle Active Availability State',
            description: 'Dynamically shifts the operational visibility boolean state of catalog assets.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            parameters: [{ name: 'reward_id', in: 'path', required: true, schema: { type: 'string' }, example: 'rwd_0020' }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['active'],
                            properties: { active: { type: 'boolean', example: false } }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'State modified successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Rewards Premium Matcha Latte active false.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/customers': {
        get: {
            summary: 'List Registered Platform Customers',
            description: 'Fetches absolute profile states tracking balances and creation dates across standard customers.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            responses: {
                200: {
                    description: 'Profiles data matrix array returned.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Fetch customers successfully.' },
                                    customers: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string', example: 'usr_1' },
                                                line_id: { type: 'string', example: 'U112233' },
                                                line_display_name: { type: 'string', example: 'Jane Dev' },
                                                line_picture_url: { type: 'string', example: 'https://img.net/1' },
                                                total_points: { type: 'number', example: 9800 },
                                                created_at: { type: 'string', example: '2026-03-12T05:00:00Z' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/customers/{user_id}/points-adjustment': {
        patch: {
            summary: 'Manual Customer Wallet Balance Override',
            description: 'Forces systemic balances overrides for loyalty points values tracking specific profile targets.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            parameters: [{ name: 'user_id', in: 'path', required: true, schema: { type: 'string' }, example: 'usr_1' }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['new_points'],
                            properties: { new_points: { type: 'number', example: 5000 } }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Overridden value committed successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Customer Jane Dev Points adjustment successfully.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/admins': {
        get: {
            summary: 'Fetch Administrative System Directory',
            description: 'Outputs auditing manifests tracking every internal console operator identity assignment record.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            responses: {
                200: {
                    description: 'Audit vector compiled.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Fetch admins successfully.' },
                                    admins: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string', example: 'adm_1' },
                                                role: { type: 'string', example: 'manager' },
                                                username: { type: 'string', example: 'root_admin' },
                                                firstname: { type: 'string', example: 'Alex' },
                                                lastname: { type: 'string', example: 'S' },
                                                password_hashed: { type: 'string', example: '$2b$10$xyz...' },
                                                created_at: { type: 'string', example: '2026-01-01T00:00:00Z' },
                                                updated_at: { type: 'string', example: '2026-01-01T00:00:00Z' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        post: {
            summary: 'Provision New Console Operator Account',
            description: 'Mints secure credentials maps establishing platform staff accounts.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['id', 'role', 'username', 'firstname', 'lastname', 'password_hashed'],
                            properties: {
                                id: { type: 'string', example: 'adm_2' },
                                role: { type: 'string', example: 'staff' },
                                username: { type: 'string', example: 'staff_user' },
                                firstname: { type: 'string', example: 'Bob' },
                                lastname: { type: 'string', example: 'R' },
                                password_hashed: { type: 'string', example: 'raw_hashed_string' },
                                created_at: { type: 'string', example: '2026-05-22T04:00:00Z' },
                                updated_at: { type: 'string', example: '2026-05-22T04:00:00Z' }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Account authorization state provisioned.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Admin created.' },
                                    new_admin: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string', example: 'adm_2' },
                                            role: { type: 'string', example: 'staff' },
                                            username: { type: 'string', example: 'staff_user' },
                                            firstname: { type: 'string', example: 'Bob' },
                                            lastname: { type: 'string', example: 'R' },
                                            password_hashed: { type: 'string', example: 'raw_hashed_string' },
                                            created_at: { type: 'string', example: '2026-05-22T04:00:00Z' },
                                            updated_at: { type: 'string', example: '2026-05-22T04:00:00Z' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/admins/{admin_id}/role-adjustment': {
        patch: {
            summary: 'Modify Operations Permission Tier',
            description: 'Alters standard execution group rights metrics bound to specific management accounts.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            parameters: [{ name: 'admin_id', in: 'path', required: true, schema: { type: 'string' }, example: 'adm_2' }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['role'],
                            properties: { role: { type: 'string', enum: ['staff', 'manager'], example: 'manager' } }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'RBAC parameters scaled successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Admin staff_user role changed.' },
                                    new_role: { type: 'string', example: 'manager' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/admins/{admin_id}/password-reset': {
        patch: {
            summary: 'Force Password Credential Replacement',
            description: 'Allows privileged administrators to reset password vectors targeting staff accounts.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            parameters: [{ name: 'admin_id', in: 'path', required: true, schema: { type: 'string' }, example: 'adm_2' }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['new_password'],
                            properties: { new_password: { type: 'string', example: 'SecureNewPassword123!' } }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Authentication secrets overwritten.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Reset Admin staff_user password successfully.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/admins/{admin_id}': {
        delete: {
            summary: 'Revoke/Delete Administrative Console Account',
            description: 'Systematically revokes system entry rights tokens by dropping admin identities.',
            tags: ['🛡️ Admin Management Panel'],
            security: [{ BearerAuth: [] }],
            parameters: [{ name: 'admin_id', in: 'path', required: true, schema: { type: 'string' }, example: 'adm_2' }],
            responses: {
                201: {
                    description: 'Account successfully expunged.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Admin staff_user deleted.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};