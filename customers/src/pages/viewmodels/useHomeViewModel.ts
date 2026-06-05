import { useState, useEffect } from 'react';
import liff from '@line/liff';

export interface UserProfileState {
    displayName: string;
    pictureUrl?: string;
    points: number; // Linked directly from your ledger database profile sync
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

                const lineProfile = await liff.getProfile();
                // Mock data fetch simulating your point-ledger API payload match
                // In production, fetch this point balance using: await apiClient.get('/api/user/points')
                setProfile({
                    displayName: lineProfile.displayName,
                    pictureUrl: lineProfile.pictureUrl,
                    points: 200, // Matches your image layout specification
                });
            } catch (err: any) {
                console.error("LIFF Core Lifecycle initialization failed:", err);
                setError(err?.message || 'Failed to authenticate identity token via LINE API.');
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