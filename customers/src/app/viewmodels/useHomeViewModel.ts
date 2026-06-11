import { useState, useEffect } from 'react';
import liff from '@line/liff';
import { API_PATH, apiClient } from '@/config/apiClient';
import { consoleLogOnDev, consoleWarnOnDev } from '@/config/constant';

export interface UserProfileState {
    user: {
        id: string;
        createdAt: Date;
        lineId: string;
        lineDisplayName: string;
        linePictureUrl: string | null;
        totalPoints: number;
    },
    access_token: string;
}

export function useHomeViewModel() {
    const [profile, setProfile] = useState<UserProfileState | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function initLiff() {
            setIsLoading(true);

            try {
                // Replace with your real LINE LIFF registration key string
                await liff.init({ liffId: '2010103019-RDfhtEOA' });

                if (!liff.isLoggedIn()) {
                    // Force execution to LINE client single sign-on screen if missing session token
                    liff.login();
                    return;
                }

                const lineAccessToken = liff.getAccessToken();
                consoleLogOnDev("Line Access Token: " + lineAccessToken);

                const res = await apiClient.get(API_PATH.syncLine, {
                    headers: { Authorization: `Bearer ${lineAccessToken}` }
                });

                const responseData = res.data;
                setProfile(responseData.data);

                localStorage.setItem('SAT', responseData.data.access_token);
            } catch (err: any) {
                consoleWarnOnDev(err);
                setError(err.msg);
            } finally {
                setIsLoading(false);
            }
        }

        initLiff();
    }, []);

    const handleLogout = () => {
        if (liff.isLoggedIn()) {
            liff.logout();
            window.location.reload();
        }
    };

    return {
        profile,
        isLoading,
        error,
        handleLogout
    };
}