import { useState, useEffect } from 'react';
import liff from '@line/liff';
import { API_PATH, apiClient } from '@/config/apiClient';
import { consoleLogOnDev, consoleWarnOnDev } from '@/config/constant';
import { useAuth } from '@/config/AuthContext';

export function useHomeViewModel() {
    const { setProfile } = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [appearConfirmLogout, setAppearConfirmLogout] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function initLiffAndProfile() {
            setIsLoading(true);
            await liff.init({ liffId: '2010103019-RDfhtEOA' });

            if (!liff.isLoggedIn()) {
                liff.login();
                return;
            }

            try {
                const res = await apiClient.get(API_PATH.syncLine);

                const responseData = res.data;
                setProfile(responseData.data.user);

                consoleLogOnDev("Receive Server Access Token: " + responseData.data.access_token)
            } catch (err: any) {
                consoleWarnOnDev(err);
                setError(err.msg);
            } finally {
                setIsLoading(false);
            }
        }

        initLiffAndProfile();
    }, []);

    return {
        isLoading,
        error,
        appearConfirmLogout,
        setAppearConfirmLogout
    };
}