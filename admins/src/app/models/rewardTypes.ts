export interface RewardItem {
    id: string;
    rewardName: string;
    pointsCost: number;
    imageUrl: string | null;
    active: boolean;
    createdAt: string;
}

export interface RewardsResponse {
    success: boolean;
    msg: string;
    data: {
        rewards: RewardItem[];
    };
}