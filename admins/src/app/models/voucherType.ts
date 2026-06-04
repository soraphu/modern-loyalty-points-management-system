export interface UserPayload {
    id: string;
    lineId: string;
    lineDisplayName: string;
    linePictureUrl: string;
}

export interface RewardPayload {
    id: string;
    rewardName: string;
    pointsCost: number;
    imageUrl: string | null;
    active: boolean;
    createdAt: string;
}

export interface Voucher {
    id: string;
    userId: string;
    rewardId: string;
    status: 'PENDING' | 'CLAIMED' | 'EXPIRED' | 'CANCELLED';
    createdAt: string;
    expiresAt: string;
    voucherCode: string;
    user: UserPayload;
    reward: RewardPayload;
}

export interface VoucherResponse {
    success: boolean;
    msg: string;
    data: {
        voucher: Voucher;
    };
}

export interface ExecutedVoucherResponse {
    success: boolean;
    msg: string;
    data: {
        transaction: {
            id: string;
            userId: string;
            referenceId: string;
            pointsAmount: number;
            type: 'REDEEM' | 'CANCEL' | 'EXPIRED';
            createdAt: string;
            adminId: string;
        };
        executed_voucher: {
            id: string;
            userId: string;
            rewardId: string;
            status: string;
            voucherCode: string;
            createdAt: string;
            expiresAt: string;
            reward: {
                id: string;
                rewardName: string;
                pointsCost: number;
                imageUrl: string | null;
                active: boolean;
                createdAt: string;
            };
        };
    };
}