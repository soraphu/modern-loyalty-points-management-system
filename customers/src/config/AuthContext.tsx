import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import liff from '@line/liff';
import axios from 'axios'; // Used for the token exchange step

interface UserProfile {
    lineUserId: string;
    lineDisplayName: string;
    linePictureUrl?: string | null;
    totalPoints: number;
}

interface AuthContextType {
    profile: UserProfile | null;
    isLoading: boolean;
    getValidToken: () => Promise<string | null>; // 🚀 Returns your secure Server Token instantly
    logout: () => void;
    updatePoints: (newPoints: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // 🔒 This state holds your secure Server Access Token in active app RAM memory
    const [serverToken, setServerToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Core initialization and refresh-recovery logic sequence
    useEffect(() => {
        async function initAndRecoverSession() {
            try {
                // 1. Initialize LINE LIFF natively
                await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });

                if (liff.isLoggedIn()) {
                    // 2. Grab the native LINE access token from memory
                    const lineToken = liff.getAccessToken();

                    if (lineToken) {
                        // ⚡ 3. EXCHANGE STEP: Send the LINE token to your server to get your Server Token
                        // 👇 PLACE YOUR REAL BACKEND LOGIN/VERIFY API PATH ROUTE STRING BELOW 👇
                        const response = await axios.post('https://api.yourdomain.com/v1/auth/line-login', {
                            line_token: lineToken
                        });

                        // Expecting your backend to return: { server_token: "...", user: { ... } }
                        const { server_token, user } = response.data;

                        // 4. Hydrate your fast React memory state layers
                        setServerToken(server_token);
                        setProfile({
                            lineUserId: user.lineUserId,
                            lineDisplayName: user.lineDisplayName,
                            linePictureUrl: user.linePictureUrl,
                            totalPoints: user.totalPoints, // Points fetched straight from your database
                        });
                    }
                } else {
                    // If the user has completely cleared cookies or is new, prompt LINE login
                    liff.login();
                }
            } catch (err) {
                console.error("Session recovery handshake failed:", err);
            } finally {
                // 5. Turn off the global loading curtain skeleton screen
                setIsLoading(false);
            }
        }

        initAndRecoverSession();
    }, []);

    // 🛡️ DYNAMIC RUNTIME SERVER TOKEN DELIVERY
    // Your API client interceptor will execute this function right before every HTTP request.
    const getValidToken = useCallback(async () => {
        return serverToken;
    }, [serverToken]);

    // Completely wipe out all local app memories and close native session locks
    const logout = useCallback(() => {
        if (liff.isLoggedIn()) {
            liff.logout();
        }
        setServerToken(null);
        setProfile(null);
        window.location.replace('/'); // Hard boot back to base landing directory
    }, []);

    // Update customer balance interface values instantly (e.g. after successful scans)
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