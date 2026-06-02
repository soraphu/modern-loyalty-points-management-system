import { useState, useEffect } from 'react';
import type { TransactionItem } from '../models/transactionTypes';
import { apiClient } from '@/config/apiClient';
import { API_PATH } from '@/config/constant';

export function useTransactionsViewModel() {
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'EARN' | 'REDEEM'>('ALL');

    const fetchTransactions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // const res = await apiClient.get(API_PATH.);

            // setTransactions(res);

        } catch (err: any) {
            setError(err?.message || 'Failed to fetch transaction logs.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Compute filters reactively based on input changes
    const filteredTransactions = transactions.filter((tx) => {
        const matchesSearch =
            tx.customerName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            tx.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            tx.adminUsername.toLowerCase().includes(searchQuery.toLowerCase().trim());

        if (typeFilter === 'EARN') return matchesSearch && tx.type === 'EARN_POINTS';
        if (typeFilter === 'REDEEM') return matchesSearch && tx.type === 'REDEEM_VOUCHER';
        return matchesSearch;
    });

    return {
        transactions: filteredTransactions,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        typeFilter,
        setTypeFilter,
        refreshLogs: fetchTransactions
    };
}//Use transactions.