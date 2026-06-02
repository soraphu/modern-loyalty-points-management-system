import { useState, useEffect } from 'react';
import { apiClient } from '@/config/apiClient';
import { filterErrorMessage } from '@/config/constant';
import type { RewardItem, RewardsResponse } from '../models/rewardTypes';
import { useHomeViewModel } from './useHomeViewModel'; // 💡 Import your current auth/role provider hook

export function useRewardsViewModel() {
    // 1. Extract the current logged-in admin state from your application context framework
    const { admin } = useHomeViewModel();

    const [rewards, setRewards] = useState<RewardItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

    // 2. Role validation flag helper (Exposed directly to the UI View layer)
    const hasWritePermission = admin?.role === 'MANAGER' || admin?.role === 'OWNER';

    const fetchRewards = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<RewardsResponse>('/api/v1/rewards');
            if (response.data?.success && response.data?.data?.rewards) {
                setRewards(response.data.data.rewards);
            } else {
                setError('Failed to resolve rewards layout.');
            }
        } catch (err: any) {
            const cleanMsg = filterErrorMessage(err).error_code || 'An unexpected error occurred.';
            setError(cleanMsg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    // 3. Locked Write Actions (Guarded by Role Boundaries)
    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        if (!hasWritePermission) {
            alert('Unauthorized: Only Managers and Owners can alter rewards state.');
            return;
        }

        try {
            // Execute standard action patch request to backend
            await apiClient.patch(`/api/v1/rewards/${id}/status`, { active: !currentStatus });
            // Optimistically update the list structure
            setRewards((prev) =>
                prev.map((item) => (item.id === id ? { ...item, active: !currentStatus } : item))
            );
        } catch (err: any) {
            alert(filterErrorMessage(err).error_code || 'Failed to update reward status.');
        }
    };

    const handleDeleteReward = async (id: string) => {
        if (!hasWritePermission) return;

        if (!window.confirm('Are you sure you want to permanently delete this reward item?')) return;

        try {
            await apiClient.delete(`/api/v1/rewards/${id}`);
            setRewards((prev) => prev.filter((item) => item.id !== id));
        } catch (err: any) {
            alert(filterErrorMessage(err).error_code || 'Failed to delete reward.');
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
        hasWritePermission, // 💡 UI conditional flags
        handleToggleStatus,
        handleDeleteReward,
        refreshRewards: fetchRewards,
    };
}