import { useState, useEffect } from 'react';
import { apiClient } from '@/config/apiClient'; // Real custom axios config wrapper
import { API_PATH, filterErrorMessage } from '@/config/constant';
import type { TransactionItem, TransactionsResponse } from '../models/transactionTypes';
import AuthAction from '@/config/authAction';

export function useTransactionsViewModel() {
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'EARN' | 'REDEEM' | 'CANCEL'>('ALL');
    const { action } = AuthAction();

    const fetchTransactions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await action(async () => await apiClient.get<TransactionsResponse>(API_PATH.getAllTransactions));

            setTransactions(res.data.data.transactions);
        } catch (err: any) {
            const cleanMsg = filterErrorMessage(err);
            setError(cleanMsg.msg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Compute filters based on real schema layout properties
    const filteredTransactions = transactions.filter((tx) => {
        const searchString = searchQuery.toLowerCase().trim();

        const matchesSearch =
            tx.id.toLowerCase().includes(searchString) ||
            tx.referenceId.toLowerCase().includes(searchString) ||
            tx.user.lineDisplayName.toLowerCase().includes(searchString) ||
            tx.admin.username.toLowerCase().includes(searchString);

        if (typeFilter === 'ALL') return matchesSearch;
        return matchesSearch && tx.type === typeFilter;
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
}