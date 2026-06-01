import { useState, useEffect } from 'react';
import type { AdminRole } from '../models/adminTypes';
import { useAuth, type AdminElements } from '@/config/authProvider';

export function useHomeViewModel() {
    // Mocking the active user session. In production, this can come from your Auth Context!
    const [currentUser, setCurrentUser] = useState<AdminElements | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { admin } = useAuth();

    useEffect(() => {
        setCurrentUser(admin);
        setIsLoading(false);
    }, []);

    // Role verification helper algorithm
    const checkPermission = (requiredRole: AdminRole): boolean => {
        if (!currentUser) return false;

        const roleHierarchy: Record<AdminRole, number> = {
            'STAFF': 1,
            'MANAGER': 2,
            'OWNER': 3
        };

        return roleHierarchy[currentUser.role] >= roleHierarchy[requiredRole];
    };

    const handleLogout = () => {
        // localStorage.removeItem('access_token');
        window.location.href = '/login';
    };

    return {
        currentUser,
        isLoading,
        admin,
        checkPermission,
        handleLogout
    };
} //useHomeViewModel