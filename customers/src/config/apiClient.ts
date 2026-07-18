import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import liff from '@line/liff';
import { filterErrorMessage } from './constant';

export const API_PATH = {
    syncLine: '/sync', // 💡 This is your login/exchange endpoint
    fetchTransactions: '/transactions',
    earnPoints: '/earn-points',
    fetchRewards: '/rewards',
    redemptionRewards: (rewardId: string) => `/rewards/${rewardId}/redeem`,
};

// Internal fast-RAM memory variable to store your actual server token
let memoryServerToken: string | null = null;

export const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
    timeout: 60000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 🛡️ DYNAMIC REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
    async (config) => {
        // A. If we are hitting the sync endpoint, we MUST use the LINE token to authenticate
        if (config.url === API_PATH.syncLine) {
            if (liff.isLoggedIn()) {
                const lineToken = liff.getAccessToken();
                if (lineToken) {
                    config.headers.Authorization = `Bearer ${lineToken}`;
                }
            }
            return config;
        }

        // B. For ALL other database actions, we use your actual Server Access Token (Wristband)
        if (memoryServerToken) {
            config.headers.Authorization = `Bearer ${memoryServerToken}`;
            return config;
        }

        // C. EDGE CASE TRAP: What if lineToken exists, but serverToken is missing?
        // This means the page reloaded or the server token expired. We quietly exchange it on the fly!
        if (liff.isLoggedIn()) {
            const lineToken = liff.getAccessToken();
            if (lineToken) {
                try {
                    // Quietly hit your sync route to get a brand new wristband right now
                    const exchangeResponse = await axios.get(API_PATH.syncLine, {
                        headers: { Authorization: `Bearer ${lineToken}` }
                    });

                    const { success, data } = exchangeResponse.data;

                    if (success && data?.access_token) {
                        memoryServerToken = data.access_token;
                        config.headers.Authorization = `Bearer ${memoryServerToken}`;

                    }
                } catch (err) {
                    console.error('On-the-fly server token recovery failed:', err);
                }
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
        const finalErrorMsg = filterErrorMessage(error);
        return Promise.reject(finalErrorMsg);
    }
);