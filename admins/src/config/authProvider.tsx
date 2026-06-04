import type { AdminRole } from '@/app/models/adminTypes';
import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';
import { apiClient } from './apiClient';
import { consoleLogOnDev } from './constant';
import { toast } from 'sonner';

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
    setCurrentAdmin: (adminData: AdminElements) => void;
    handleLogout: () => void;
    getAccessToken: () => string | null;
    setAccessToken: (accessToken: string) => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

// 2. Create the Context with a strict type (initially null)
const AuthContext = createContext<AuthContextType | null>(null);

export function setupAuthHeader(token: string | null) {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
}

// 3. Create the Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
    const [admin, setAdmin] = useState<AdminElements | null>(null);
    const tokenRef = useRef<string | null>(null);

    // Log the user in and save the token silently in the ref
    const setCurrentAdmin = useCallback((adminData: AdminElements) => {
        setAdmin(adminData); // Triggers single re-render to switch UI to Auth state
    }, []);

    const setAccessToken = useCallback((accessToken: string) => {
        tokenRef.current = accessToken;
    }, []);

    // Log the user out and clean memory
    const handleLogout = useCallback(async () => {
        try {
            setupAuthHeader(tokenRef.current);
            await apiClient.post('/logout', {});

        } catch (error: any) {
            consoleLogOnDev(error.response);
            toast.error('Logout failed. Please try again before leaving the page.');
        } finally {
            tokenRef.current = null;
            setAdmin(null);
            window.location.href = '/login';
        }
    }, []);

    // Safe method for API abstraction layers to fetch the string securely
    const getAccessToken = useCallback(() => {
        return tokenRef.current;
    }, []);

    const isAuthenticated = !!admin;

    return (
        <AuthContext.Provider value={{ admin, isAuthenticated, setCurrentAdmin, handleLogout, getAccessToken, setAccessToken }}>
            {children}
        </ AuthContext.Provider >
    );
}//AuthProvider

// 4. Custom Hook with built-in Type Guard checking
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}