import { useState, useEffect } from 'react';
import { apiClient } from '@/config/apiClient';
import { API_PATH, filterErrorMessage } from '@/config/constant';
import type { RewardItem, RewardsResponse } from '../models/rewardTypes';
import { useHomeViewModel } from './useHomeViewModel';
import AuthAction from '@/config/authAction';

export function useRewardsViewModel() {
    const { admin } = useHomeViewModel();
    const { action } = AuthAction();

    const [rewards, setRewards] = useState<RewardItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [activeAction, setActiveAction] = useState<{
        title: string;
        description: string;
        variant: "destructive" | "amber";
        onConfirm: () => Promise<void>;
    } | null>(null);

    const hasWritePermission = admin?.role === 'MANAGER' || admin?.role === 'OWNER';

    const fetchRewards = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await action(async () => await apiClient.get<RewardsResponse>(API_PATH.getRewards));
            if (response.data?.success && response.data?.data?.rewards) {
                setRewards(response.data.data.rewards);
            } else {
                setError('Failed to resolve rewards layout.');
            }
        } catch (err: any) {
            const cleanMsg = filterErrorMessage(err);
            setError(cleanMsg.msg || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        if (!hasWritePermission) {
            alert('Unauthorized: Only Managers and Owners can alter rewards state.');
            return;
        }

        try {
            await action(async () => await apiClient.patch(API_PATH.adjustRewardState(id), { active: !currentStatus }));
            setRewards((prev) =>
                prev.map((item) => (item.id === id ? { ...item, active: !currentStatus } : item))
            );
        } catch (err: any) {
            const cleanMsg = filterErrorMessage(err);
            alert(cleanMsg.msg || 'Failed to update reward status.');
        }
    };

    const handleDeleteReward = async (id: string) => {
        if (!hasWritePermission) return;

        if (!window.confirm('Are you sure you want to permanently delete this reward item?')) return;

        try {
            await action(async () => await apiClient.delete(API_PATH.deleteReward(id)));
            setRewards((prev) => prev.filter((item) => item.id !== id));
        } catch (err: any) {
            const cleanMsg = filterErrorMessage(err);
            alert(cleanMsg.msg || 'Failed to delete reward.');
        }
    };

    const handleCreateReward = async (payload: { reward_name: string; points_cost: number; active: boolean; image_url?: string | null }) => {
        if (!hasWritePermission) {
            alert('Unauthorized: Only Managers and Owners can create rewards.');
            return;
        }

        try {
            const response = await action(async () => await apiClient.post(API_PATH.createReward, payload));
            if (response.data?.success && response.data?.data?.new_reward) {
                setRewards((prev) => [response.data.data.new_reward, ...prev]);
            }
            return response.data;
        } catch (err: any) {
            const cleanMsg = filterErrorMessage(err);
            throw cleanMsg;
        }
    };

    const handleAdjustRewardPointsCost = async (id: string, newPointsCost: number) => {
        if (!hasWritePermission) {
            alert('Unauthorized: Only Managers and Owners can alter reward points cost.');
            return;
        }

        try {
            const res = await action(async () => await apiClient.patch(API_PATH.adjustRewardPointsCost(id), { points_cost: newPointsCost }));
            setRewards((prev) =>
                prev.map((item) => (item.id === id ? { ...item, pointsCost: newPointsCost } : item))
            );
            return res.data;
        } catch (err: any) {
            const cleanMsg = filterErrorMessage(err);
            alert(cleanMsg.msg || 'Failed to update reward points cost.');
            throw cleanMsg;
        }
    };

    const filteredRewards = rewards.filter((item) => {
        const matchesSearch = item.rewardName.toLowerCase().includes(searchQuery.toLowerCase().trim());
        if (statusFilter === 'ACTIVE') return matchesSearch && item.active;
        if (statusFilter === 'INACTIVE') return matchesSearch && !item.active;
        return matchesSearch;
    });

    return {
        rewards: filteredRewards,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        hasWritePermission,
        handleToggleStatus,
        handleDeleteReward,
        handleCreateReward,
        handleAdjustRewardPointsCost,
        refreshRewards: fetchRewards,
        activeAction,
        setActiveAction
    };
}