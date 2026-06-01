import type { AdminRole } from '@/app/models/adminTypes';
import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';

// 1. Define the TypeScript interfaces
export interface AdminElements {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    role: AdminRole;
    avatarUrl?: string;
}

interface AuthContextType {
    admin: AdminElements | null;
    isAuthenticated: boolean;
    setLogin: (userData: AdminElements, accessToken: string) => void;
    setLogout: () => void;
    getAccessToken: () => string | null;
}

interface AuthProviderProps {
    children: ReactNode;
}

// 2. Create the Context with a strict type (initially null)
const AuthContext = createContext<AuthContextType | null>(null);

// 3. Create the Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
    const [admin, setAdmin] = useState<AdminElements | null>(null);
    const tokenRef = useRef<string | null>(null);

    // Log the user in and save the token silently in the ref
    const setLogin = useCallback((userData: AdminElements, accessToken: string) => {
        tokenRef.current = accessToken;
        setAdmin(userData); // Triggers single re-render to switch UI to Auth state
    }, []);

    // Log the user out and clean memory
    const setLogout = useCallback(() => {
        tokenRef.current = null;
        setAdmin(null);
    }, []);

    // Safe method for API abstraction layers to fetch the string securely
    const getAccessToken = useCallback(() => {
        return tokenRef.current;
    }, []);

    const isAuthenticated = !!admin;

    return (
        <AuthContext.Provider value={{ admin, isAuthenticated, setLogin, setLogout, getAccessToken }}>
            {children}
        </ AuthContext.Provider >
    );
}

// 4. Custom Hook with built-in Type Guard checking
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}