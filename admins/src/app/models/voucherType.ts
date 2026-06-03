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