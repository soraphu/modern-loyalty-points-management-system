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

export function useHistoryViewModel() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<TransactionType | "ALL">("ALL");

    const { authLoading } = useAuth();

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
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
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        fetchTransactions();
    }, [authLoading, fetchTransactions]);

    // Client-side filtering logic
    const filteredTransactions = useMemo(() => {
        if (activeFilter === "ALL") return transactions;
        return transactions.filter((tx) => tx.type === activeFilter);
    }, [transactions, activeFilter]);

    return {
        transactions: filteredTransactions,
        rawCount: transactions.length,
        isLoading,
        error,
        activeFilter,
        setActiveFilter,
        refetch: fetchTransactions,
    };
}