import 'dotenv/config';

export const CONFIG = {
    LINE_API: 'https://api.line.me/v2/profile',
    JWT_SECRET: process.env.JWT_SECRET || 'super-secret-dee-points-key-xx',
    API_PREFIX: '/api/v1',
    VOUCHER_EXPIRE_PLUS_DAY: 1, //day
    API_DEFAULT_LIMIT: 20,
    NODE_ENV: process.env.NODE_ENV || 'development',
    SALT_ROUNDS: 10,
};

