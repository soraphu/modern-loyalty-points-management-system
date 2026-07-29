import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import liff from '@line/liff';
import { consoleLogOnDev, consoleWarnOnDev } from './constant';
import { API_PATH, apiClient } from './apiClient';

// 💡 Matches your exact backend "user" JSON payload fields
interface UserProfile {
    id: string;
    createdAt: Date;
    lineId: string;
    lineDisplayName: string;
    linePictureUrl: string | null;
    totalPoints: number;
}

interface AuthContextType {
    profile: UserProfile | null;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
    logout: () => void;
    updatePoints: (newPoints: number) => void;
    authLoading: boolean;
    authError: string | null;
    setAuthError: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [authLoading, setAuthLoading] = useState<boolean>(false);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        async function initLiffAndProfile() {
            setAuthLoading(true);
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
                setAuthError(err.msg);
            } finally {
                setAuthLoading(false);
            }
        }

        initLiffAndProfile();
    }, []);

    // Clean exit teardown sequence
    const logout = useCallback(() => {
        if (liff.isLoggedIn()) {
            liff.logout();
        }
        setProfile(null);
        window.location.replace('/');
    }, []);

    // Instantly reflect balance changes across dashboard UI sections
    const updatePoints = useCallback((newPoints: number) => {
        setProfile((prev) => {
            if (!prev) return null;
            return { ...prev, totalPoints: newPoints };
        });
    }, []);

    return (
        <AuthContext.Provider value={{ profile, authLoading, authError, setProfile, setAuthError, logout, updatePoints }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be wrapped tightly inside an <AuthProvider /> structural wrapper.');
    }
    return context;
}