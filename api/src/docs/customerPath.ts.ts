export const customerPaths = {
    '/customer/sync': {
        post: {
            summary: 'Sync LINE Account Profile',
            description: 'Initializes or synchronizes an external LINE application profile with the customer account registry.',
            tags: ['👥 Customer Domain'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['line_id', 'display_name', 'picture_url'],
                            properties: {
                                line_id: { type: 'string', example: 'U123456789abcdef' },
                                display_name: { type: 'string', example: 'Somchai Dee' },
                                picture_url: { type: 'string', format: 'uri', example: 'https://profile.line-scdn.net/abc' }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Sync executed successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Sync successfully.' },
                                    user: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string', example: 'usr_abc123' },
                                            line_id: { type: 'string', example: 'U123456789abcdef' },
                                            line_display_name: { type: 'string', example: 'Somchai Dee' },
                                            line_picture_url: { type: 'string', example: 'https://profile.line-scdn.net/abc' },
                                            total_points: { type: 'integer', example: 450 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Required payload keys are missing.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    msg: { type: 'string', example: 'Required fields missing.' },
                                    error_code: { type: 'string', example: 'FIELDS_MISSING' }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: 'Internal gateway engine dependency error.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    msg: { type: 'string', example: 'Login failed : internal crash' },
                                    error_code: { type: 'string', example: 'SERVER_ERROR' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/customer/earn-points': {
        post: {
            summary: 'Earn Points via Code String',
            description: 'Parses secure point issuance payloads to increment an authenticated user wallet.',
            tags: ['👥 Customer Domain'],
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['code_string'],
                            properties: { code_string: { type: 'string', example: 'qr_dee_tx_881a' } }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Points successfully credited.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Earn 100 points successfully.' }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Validation failed or authorization header missing.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    msg: { type: 'string', example: 'Access token missing.' },
                                    error_code: { type: 'string', example: 'ACC_TOKEN_MISSING' }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'QR sequence invalid or already spent.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    msg: { type: 'string', example: 'Invalid QR Code or expired.' },
                                    error_code: { type: 'string', example: 'EXPIRED' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/customer/transactions': {
        get: {
            summary: 'Fetch Transaction Ledger History',
            description: 'Compiles individual historical ledger statements logging all reward drawdowns and earn balances.',
            tags: ['👥 Customer Domain'],
            security: [{ BearerAuth: [] }],
            responses: {
                200: {
                    description: 'Ledger statement successfully compiled.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Fetch transactions successfully.' },
                                    transactions: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string', example: 'tx_8819' },
                                                user_id: { type: 'string', example: 'usr_abc123' },
                                                reference_id: { type: 'string', example: 'ref_vch_09' },
                                                points_amount: { type: 'string', example: '250' },
                                                type: { type: 'string', enum: ['REDEEM', 'EARN'], example: 'REDEEM' }
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
    '/customer/rewards': {
        get: {
            summary: 'Fetch Active Rewards Catalog',
            description: 'Queries all active rewards configurations available for purchase across the ledger network.',
            tags: ['👥 Customer Domain'],
            security: [{ BearerAuth: [] }],
            responses: {
                200: {
                    description: 'Catalog list fetched successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Fetch rewards successfully.' },
                                    rewards: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string', example: 'rwd_0019' },
                                                name: { type: 'string', example: 'Free Hot Americano' },
                                                points_cost: { type: 'integer', example: 120 },
                                                image_url: { type: 'string', example: 'https://cdn.deepoints.com/coffee.png' },
                                                active: { type: 'boolean', example: true },
                                                created_at: { type: 'string', example: '2026-01-10T00:00:00Z' }
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
    '/customer/rewards/{reward_id}/redeem': {
        post: {
            summary: 'Redeem Point Balance for Voucher',
            description: 'Atomically deducts user points balance reserves to issue a valid digital usage voucher asset.',
            tags: ['👥 Customer Domain'],
            security: [{ BearerAuth: [] }],
            parameters: [
                { name: 'reward_id', in: 'path', required: true, schema: { type: 'string' }, example: 'rwd_0019' }
            ],
            responses: {
                201: {
                    description: 'Deduction and transaction voucher created successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    msg: { type: 'string', example: 'Redemption created.' },
                                    new_voucher: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string', example: 'vch_9921' },
                                            user_id: { type: 'string', example: 'usr_abc123' },
                                            reward_id: { type: 'string', example: 'rwd_0019' },
                                            status: { type: 'string', example: 'ACTIVE' },
                                            created_at: { type: 'string', example: '2026-05-22T04:00:00Z' },
                                            expires_at: { type: 'string', example: '2026-08-22T23:59:59Z' },
                                            reward: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string', example: 'rwd_0019' },
                                                    name: { type: 'string', example: 'Free Hot Americano' },
                                                    points_cost: { type: 'string', example: '120' },
                                                    image_url: { type: 'string', example: 'https://cdn.deepoints.com/coffee.png' },
                                                    active: { type: 'boolean', example: true },
                                                    created_at: { type: 'string', example: '2026-01-10T00:00:00Z' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Reward target identifier not found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    msg: { type: 'string', example: 'Reward not found.' },
                                    error_code: { type: 'string', example: 'NOT_FOUND' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};