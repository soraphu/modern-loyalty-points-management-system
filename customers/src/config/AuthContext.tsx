import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import liff from '@line/liff';
import { API_PATH, apiClient } from './apiClient';

// 💡 Matches your exact backend "user" JSON payload fields
interface UserProfile {
    id: string;
    lineId: string;
    lineDisplayName: string;
    linePictureUrl: string;
    totalPoints: number;
    createdAt: string;
}

interface AuthContextType {
    profile: UserProfile | null;
    isLoading: boolean;
    getValidToken: () => Promise<string | null>;
    logout: () => void;
    updatePoints: (newPoints: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [serverToken, setServerToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function initAndRecoverSession() {
            try {
                // Initialize LINE LIFF
                await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });

                if (liff.isLoggedIn()) {
                    const lineToken = liff.getAccessToken();

                    if (lineToken) {
                        const response = await apiClient.get(API_PATH.syncLine, {
                            headers: { Authorization: `Bearer ${lineToken}` }
                        });

                        const { success, data } = response.data;

                        if (success && data) {
                            setServerToken(data.access_token); // Set JWT token from response
                            setProfile(data.user);             // Set user object from response
                        }
                    }
                } else {
                    liff.login();
                }
            } catch (err) {
                console.error("Session recovery handshake failed:", err);
            } finally {
                setIsLoading(false);
            }
        }

        initAndRecoverSession();
    }, []);

    // Returns your server's secure JWT token instantly from active application RAM
    const getValidToken = useCallback(async () => {
        return serverToken;
    }, [serverToken]);

    // Clean exit teardown sequence
    const logout = useCallback(() => {
        if (liff.isLoggedIn()) {
            liff.logout();
        }
        setServerToken(null);
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
        <AuthContext.Provider value={{ profile, isLoading, getValidToken, logout, updatePoints }}>
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