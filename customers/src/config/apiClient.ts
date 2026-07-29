import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import liff from '@line/liff';
import { consoleLogOnDev, consoleWarnOnDev, filterErrorMessage } from './constant';

export const API_PATH = {
    syncLine: '/sync', // 💡 This is your login/exchange endpoint
    fetchTransactions: '/transactions',
    earnPoints: '/earn-points',
    fetchRewards: '/rewards',
    redemptionRewards: (rewardId: string) => `/rewards/${rewardId}/redeem`,
};

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Internal fast-RAM memory variable to store your actual server token
let memoryServerToken: string | null = null;

export const apiClient: AxiosInstance = axios.create({
    baseURL: baseURL,
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
        // If we are hitting the sync endpoint, we MUST use the LINE token to authenticate
        if (config.url === API_PATH.syncLine) {
            if (liff.isLoggedIn()) {
                const lineToken = liff.getAccessToken();
                if (lineToken) {
                    config.headers.Authorization = `Bearer ${lineToken}`;
                }
            }
            return config;
        }

        if (!liff.isLoggedIn()) {
            memoryServerToken = null;
            return config;
        }

        // EDGE CASE TRAP: What if lineToken exists, but serverToken is missing?
        // This means the page reloaded or the server token expired. We quietly exchange it on the fly!
        if (liff.isLoggedIn()) {

            if (memoryServerToken) {
                config.headers.Authorization = `Bearer ${memoryServerToken}`;
                return config;
            }

            consoleWarnOnDev("Server token missing. Attempting on-the-fly recovery using LINE token...");
            const lineToken = liff.getAccessToken();

            if (lineToken) {
                try {
                    // Quietly hit your sync route to get a brand new wristband right now
                    const exchangeResponse = await axios.get(baseURL + API_PATH.syncLine, {
                        headers: { Authorization: `Bearer ${lineToken}` }
                    });

                    consoleLogOnDev("New server token-exchange response:");
                    consoleLogOnDev(exchangeResponse);
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