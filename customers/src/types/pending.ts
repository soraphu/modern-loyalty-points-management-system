/**
 * Types & Interfaces for Pending Vouchers Flow
 * Follows strict TypeScript typing (RULE-TS-1, RULE-FE-3)
 */

export type VoucherStatus = 'PENDING' | 'CLAIMED' | 'EXPIRED' | 'CANCELLED';

export interface Reward {
    id: string;
    rewardName: string;
    pointsCost: number;
    imageUrl: string | null;
    active: boolean;
    createdAt: string;
}

export interface PendingVoucher {
    id: string;
    userId: string;
    rewardId: string;
    status: VoucherStatus;
    voucherCode: string;
    createdAt: string;
    expiresAt: string | null;
    reward?: Reward;
}

export interface PendingVouchersApiResponse {
    statusCode: number;
    msg: string;
    data: {
        vouchers: PendingVoucher[];
    };
}

export interface PendingVouchersState {
    vouchers: PendingVoucher[];
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    selectedVoucher: PendingVoucher | null;
    isModalOpen: boolean;
    copiedCode: string | null;
}

export interface PendingVouchersActions {
    fetchPendingVouchers: (isManualRefresh?: boolean) => Promise<void>;
    handleOpenVoucherModal: (voucher: PendingVoucher) => void;
    handleCloseModal: () => void;
    handleCopyCode: (code: string) => Promise<void>;
    clearError: () => void;
}

export type UsePendingViewModelReturn = PendingVouchersState & PendingVouchersActions;
