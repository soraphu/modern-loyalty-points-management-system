import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { filterErrorMessage } from './constant';

export const API_PATH = {
    syncLine: '/sync',
    fetchTransactions: '/transactions',
    earnPoints: '/earn-points',
    fetchRewards: '/rewards',
    redemptionRewards: (rewardId: string) => `/rewards/${rewardId}/redeem`,
}

export const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
    timeout: 60000,

    withCredentials: true,

    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        const finalErrorMsg = filterErrorMessage(error);

        return Promise.reject(finalErrorMsg);
    }
);
