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
    const [appearConfirmLogout, setAppearConfirmLogout] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function initLiff() {
            setIsLoading(true);

            await liff.init({ liffId: '2010103019-RDfhtEOA' });

            if (!liff.isLoggedIn()) {
                liff.login();
                return;
            }

            try {
                const res = await apiClient.get(API_PATH.syncLine);

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
        setIsLoading(true);
        if (liff.isLoggedIn()) {
            liff.logout();
            setIsLoading(false);
            window.location.reload();
        }
    };

    return {
        profile,
        isLoading,
        error,
        handleLogout,
        appearConfirmLogout,
        setAppearConfirmLogout
    };
}