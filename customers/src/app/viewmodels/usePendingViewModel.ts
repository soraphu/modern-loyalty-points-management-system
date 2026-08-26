import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, API_PATH } from '@/config/apiClient';
import { useAuth } from '@/config/AuthContext';
import { consoleLogOnDev, consoleWarnOnDev } from '@/config/constant';
import type {
    PendingVoucher,
    UsePendingViewModelReturn,
} from '@/types/pending';

const POLLING_INTERVAL_MS = 30_000; // 30 seconds auto-refresh

export function usePendingViewModel(): UsePendingViewModelReturn {
    const { authLoading, authError } = useAuth();

    const [vouchers, setVouchers] = useState<PendingVoucher[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedVoucher, setSelectedVoucher] = useState<PendingVoucher | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch Pending Vouchers from API
    const fetchPendingVouchers = useCallback(
        async (isManualRefresh: boolean = false) => {
            if (isManualRefresh) {
                setIsRefreshing(true);
            }
            setError(null);

            try {
                const response = await apiClient.get(API_PATH.fetchPendingVouchers);
                consoleLogOnDev(response.data);

                const fetchedVouchers: PendingVoucher[] =
                    response.data?.data?.vouchers || [];
                setVouchers(fetchedVouchers);
            } catch (err: any) {
                consoleWarnOnDev('Failed to fetch pending vouchers:', err);
                const errorMsg =
                    err?.msg ||
                    err?.message ||
                    'Unable to load pending vouchers. Please check your network connection.';
                setError(errorMsg);
            } finally {
                setIsLoading(false);
                if (isManualRefresh) {
                    setIsRefreshing(false);
                }
            }
        },
        []
    );

    // Initial Execution: Guarded against premature execution while Auth / LIFF initializes
    useEffect(() => {
        if (authLoading) return;

        if (authError) {
            setError(authError);
            setIsLoading(false);
            return;
        }

        fetchPendingVouchers(false);
    }, [authLoading, authError, fetchPendingVouchers]);

    // Setup 30s background polling interval with automatic cleanup
    useEffect(() => {
        if (authLoading) return;

        pollingTimerRef.current = setInterval(() => {
            consoleLogOnDev('Background pending vouchers polling (30s)...');
            fetchPendingVouchers(false);
        }, POLLING_INTERVAL_MS);

        return () => {
            if (pollingTimerRef.current) {
                clearInterval(pollingTimerRef.current);
                pollingTimerRef.current = null;
            }
        };
    }, [authLoading, fetchPendingVouchers]);

    // Open Voucher Details Modal
    const handleOpenVoucherModal = (voucher: PendingVoucher) => {
        setSelectedVoucher(voucher);
        setIsModalOpen(true);
    };

    // Close Voucher Details Modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVoucher(null);
        setCopiedCode(null);
    };

    // Copy Voucher Code to Clipboard
    const handleCopyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => {
                setCopiedCode(null);
            }, 2500);
        } catch (err) {
            consoleWarnOnDev('Failed to copy to clipboard:', err);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return {
        vouchers,
        isLoading: isLoading || authLoading,
        isRefreshing,
        error,
        selectedVoucher,
        isModalOpen,
        copiedCode,
        fetchPendingVouchers,
        handleOpenVoucherModal,
        handleCloseModal,
        handleCopyCode,
        clearError,
    };
}
