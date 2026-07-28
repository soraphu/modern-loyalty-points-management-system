import { useState, useEffect, useCallback } from "react";
import { apiClient, API_PATH } from "@/config/apiClient";

// 📦 REAL MODEL DEFINITION (Matching your exact JSON response)
export interface Reward {
    id: string;
    rewardName: string;
    pointsCost: number;
    imageUrl: string | null;
    active: boolean;
    createdAt: string;
}

export function useAvailableRewardsViewModel(userPoints: number = 0) {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Modal & Redemption State
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Fetch Rewards
    const fetchRewards = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(API_PATH.fetchRewards);

            setRewards(response.data.data.rewards);
        } catch (err: any) {
            setError(err?.msg || "Failed to load rewards. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRewards();
    }, [fetchRewards]);

    // Modal Controls
    const handleOpenRedeemModal = (reward: Reward) => {
        setSelectedReward(reward);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (!isRedeeming) {
            setIsModalOpen(false);
            setSelectedReward(null);
        }
    };

    // Async Redemption
    const handleConfirmRedeem = async () => {
        if (!selectedReward) return;

        setIsRedeeming(true);
        try {
            await apiClient.post(API_PATH.redemptionRewards(selectedReward.id));
            await fetchRewards(); // Refresh list after successful redeem
            handleCloseModal();
        } catch (err: any) {
            alert(err?.response?.data?.msg || "Redemption failed.");
        } finally {
            setIsRedeeming(false);
        }
    };

    return {
        rewards,
        isLoading,
        error,
        userPoints,
        selectedReward,
        isRedeeming,
        isModalOpen,
        fetchRewards,
        handleOpenRedeemModal,
        handleCloseModal,
        handleConfirmRedeem,
    };
}