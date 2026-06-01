import { useState, useEffect } from 'react';
import type { AdminRole } from '../models/adminTypes';
import { useAuth } from '@/config/authProvider';
import AuthAction from '@/config/authAction';

export function useHomeViewModel() {
    // Mocking the active user session. In production, this can come from your Auth Context!
    const [isLoading, setIsLoading] = useState(true);
    const { fetchAdminProfile } = AuthAction();

    useEffect(() => {
        if (!admin) fetchAdminProfile();
        setIsLoading(false);
    }, []);

    const { admin, handleLogout } = useAuth();

    // Role verification helper algorithm
    const checkPermission = (requiredRole: AdminRole): boolean => {
        if (!admin) return false;

        const roleHierarchy: Record<AdminRole, number> = {
            'STAFF': 1,
            'MANAGER': 2,
            'OWNER': 3
        };

        return roleHierarchy[admin.role] >= roleHierarchy[requiredRole];
    };

    return {
        isLoading,
        admin,
        checkPermission,
        handleLogout
    };
} //useHomeViewModel