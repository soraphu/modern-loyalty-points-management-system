export interface Customer {
    id: string;
    lineId: string;
    lineDisplayName: string;
    linePictureUrl: string | null;
    totalPoints: number;
    createdAt: string;
}

export interface CustomerListResponse { data: { customers: Customer[] } }