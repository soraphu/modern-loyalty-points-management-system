export type TransactionType = 'EARN' | 'REDEEM';

export interface TransactionUser {
    id: string;
    lineId: string;
    lineDisplayName: string;
    linePictureUrl: string;
}

export interface TransactionAdmin {
    id: string;
    username: string;
}

export interface TransactionItem {
    id: string;
    userId: string;
    adminId: string;
    referenceId: string;
    pointsAmount: number;
    type: TransactionType;
    createdAt: string;
    user: TransactionUser;
    admin: TransactionAdmin;
}

export interface TransactionsResponse {
    success: boolean;
    msg: string;
    data: {
        transactions: TransactionItem[];
    };
}