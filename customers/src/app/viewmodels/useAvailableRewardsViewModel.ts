import { useState, useEffect, useCallback } from "react";
import { apiClient, API_PATH } from "@/config/apiClient";
import { useAuth } from "@/config/AuthContext";
import { consoleLogOnDev } from "@/config/constant";

// 📦 REAL MODEL DEFINITION (Matching your exact JSON response)
export interface Reward {
    id: string;
    rewardName: string;
    pointsCost: number;
    imageUrl: string | null;
    active: boolean;
    createdAt: string;
}

export interface RedeemSuccessData {
    remainingPoints: number;
    voucher: Voucher;
}

export interface Voucher {
    id: string;
    userId: string;
    rewardId: string;
    status: string;
    voucherCode: string;
    [key: string]: any;
}

// Result Dialog State
export interface RedeemResultModalState {
    isOpen: boolean;
    isSuccess: boolean;
    title: string;
    description: string;
    data?: RedeemSuccessData | null;
}

export function useAvailableRewardsViewModel() {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { authLoading, profile, setProfile } = useAuth();

    // Modal & Redemption State
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [resultModal, setResultModal] = useState<RedeemResultModalState>({
        isOpen: false,
        isSuccess: false,
        title: "",
        description: "",
        data: null,
    });

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
        if (authLoading) return;
        fetchRewards();
    }, [authLoading]);

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

    const handleCloseResultModal = () => {
        setResultModal((prev) => ({ ...prev, isOpen: false }));
    };

    // Async Redemption
    const handleConfirmRedeem = async () => {
        if (!selectedReward) return;

        setIsRedeeming(true);
        try {
            const res = await apiClient.post(API_PATH.redemptionRewards(selectedReward.id));
            consoleLogOnDev(res.data);
            handleCloseModal();
            await fetchRewards(); // Refresh list after successful redeem

            setProfile((prevProfile) => {
                if (!prevProfile) return null;

                return {
                    ...prevProfile,
                    totalPoints: res.data?.data.remainingPoints,
                };
            });

            setResultModal({
                isOpen: true,
                isSuccess: true,
                title: "Redemption Successful!",
                description: res.data?.msg || "Your voucher has been created successfully.",
                data: res.data?.data as RedeemSuccessData,
            });
        } catch (err: any) {
            // 🎯 Set Error Result Dialog
            setResultModal({
                isOpen: true,
                isSuccess: false,
                title: "Redemption Failed",
                description:
                    err?.msg || "Failed to redeem reward. Please try again.",
                data: null,
            });
        } finally {
            setIsRedeeming(false);
        }
    };

    return {
        rewards,
        isLoading,
        error,
        selectedReward,
        isRedeeming,
        isModalOpen,
        resultModal,
        fetchRewards,
        handleOpenRedeemModal,
        handleCloseModal,
        handleConfirmRedeem,
        handleCloseResultModal
    };
}