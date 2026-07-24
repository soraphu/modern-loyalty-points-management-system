import { useState, useEffect, useCallback } from "react";
import { API_PATH, apiClient } from '@/config/apiClient';

// 📦 MODEL DEFINITION (Inlined directly with the ViewModel)
export interface Reward {
    id: string;
    title: string;
    description: string;
    pointsRequired: number;
    imageUrl?: string;
    expiryDate?: string;
    stock?: number;
}

export function useRewardsViewModel(userPoints: number = 0) {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Modal & Redemption State Management
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Fetch Available Rewards
    const fetchRewards = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(API_PATH.fetchRewards);
            setRewards(response.data?.data || response.data || []);
        } catch (err: any) {
            setError(err?.message || "Failed to load rewards. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRewards();
    }, [fetchRewards]);

    // Modal Trigger Handlers
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

    // Async Redemption Request
    const handleConfirmRedeem = async () => {
        if (!selectedReward) return;

        setIsRedeeming(true);
        try {
            await apiClient.post(API_PATH.redemptionRewards(selectedReward.id));

            // Refresh list after successful redemption
            await fetchRewards();
            handleCloseModal();
        } catch (err: any) {
            alert(err || "Redemption failed.");
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