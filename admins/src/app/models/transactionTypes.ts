export type TransactionType = 'EARN_POINTS' | 'REDEEM_VOUCHER' | 'CANCEL_VOUCHER';

export interface TransactionItem {
    id: string;
    adminId: string;
    customerId: string;
    customerName: string;
    lineDisplayName: string;
    type: TransactionType;
    pointsAmount: number;
    referenceDetail: string; // e.g., "Scanned QR Code" or "Redeemed TEST_REDEEM"
    createdAt: string;
    adminUsername: string;
}

export interface TransactionsResponse {
    success: boolean;
    msg: string;
    data: {
        transactions: TransactionItem[];
        totalCount: number;
    };
}