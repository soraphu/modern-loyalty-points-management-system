export const adminPaths = {
    '/admin/rewards': {
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
    '/admin/rewards/{id}': {
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
                                    msg: { type: 'string', example: 'Reward deleted.' }
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
                                                created_at: { type: 'string', example: '2026-01-01T00:00:00Z' }
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
                                    msg: { type: 'string', example: 'Admin created.' }
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