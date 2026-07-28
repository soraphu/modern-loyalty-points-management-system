import React, { createContext, useContext, useState, useCallback } from 'react';
import liff from '@line/liff';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);

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
        <AuthContext.Provider value={{ profile, setProfile, logout, updatePoints }}>
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