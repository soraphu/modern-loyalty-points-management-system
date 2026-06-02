import { useState, useEffect } from 'react';
import { apiClient } from '@/config/apiClient';
import { filterErrorMessage } from '@/config/constant';
import type { RewardItem, RewardsResponse } from '../models/rewardTypes';

export function useRewardsViewModel() {
    const [rewards, setRewards] = useState<RewardItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

    const fetchRewards = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Execute standard request targeting rewards collection route layout
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

    // Automatically fetch on mount structure phase
    useEffect(() => {
        fetchRewards();
    }, []);

    // Compute filtering layers cleanly without unnecessary re-renders
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
        refreshRewards: fetchRewards,
    };
}