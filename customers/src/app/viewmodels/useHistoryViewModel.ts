import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient, API_PATH } from "@/config/apiClient";
import { useAuth } from "@/config/AuthContext";

export type TransactionType = "EARN" | "REDEEM" | "CANCEL" | "EXPIRED";

export interface Transaction {
    id: string;
    userId: string;
    adminId: string;
    referenceId: string;
    pointsAmount: number;
    type: TransactionType;
    createdAt: string;
}

export interface TransactionApiResponse {
    success: boolean;
    msg: string;
    data: {
        transactions: Transaction[];
    };
}

export interface UseHistoryViewModelReturn {
    transactions: Transaction[];
    rawCount: number;
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    activeFilter: TransactionType | "ALL";
    setActiveFilter: React.Dispatch<React.SetStateAction<TransactionType | "ALL">>;
    refetch: () => Promise<void>;
    handleRefresh: () => Promise<void>;
}

export function useHistoryViewModel(): UseHistoryViewModelReturn {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<TransactionType | "ALL">("ALL");

    const { authLoading } = useAuth();

    const fetchTransactions = useCallback(async (isManualRefresh: boolean = false) => {
        if (isManualRefresh) {
            setIsRefreshing(true);
        }
        setError(null);

        try {
            const response = await apiClient.get<TransactionApiResponse>(
                API_PATH.fetchTransactions
            );
            setTransactions(response.data.data.transactions);
        } catch (err: any) {
            setError(
                err?.response?.data?.msg || err?.msg || "Failed to load transaction history."
            );
        } finally {
            setIsLoading(false);
            if (isManualRefresh) {
                setIsRefreshing(false);
            }
        }
    }, []);

    const refetch = useCallback(async () => {
        if (authLoading) return;
        await fetchTransactions(false);
    }, [authLoading, fetchTransactions]);

    const handleRefresh = useCallback(async () => {
        if (authLoading) return;
        await fetchTransactions(true);
    }, [authLoading, fetchTransactions]);

    useEffect(() => {
        if (authLoading) return;

        void fetchTransactions(false);
    }, [authLoading, fetchTransactions]);

    // Client-side filtering logic
    const filteredTransactions = useMemo(() => {
        if (activeFilter === "ALL") return transactions;
        return transactions.filter((tx) => tx.type === activeFilter);
    }, [transactions, activeFilter]);

    return {
        transactions: filteredTransactions,
        rawCount: transactions.length,
        isLoading: isLoading || authLoading,
        isRefreshing,
        error,
        activeFilter,
        setActiveFilter,
        refetch,
        handleRefresh,
    };
}