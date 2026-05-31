import { useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../models/homeTypes';

export function useHomeViewModel() {
    // Mocking the active user session. In production, this can come from your Auth Context!
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate reading current user profile session data
        setTimeout(() => {
            setCurrentUser({
                id: 'usr_9921',
                username: 'soraphu',
                firstname: 'Soraphu',
                lastname: 'Thongjun',
                role: 'OWNER'
            });
            setIsLoading(false);
        }, 1000);
    }, []);

    // Role verification helper algorithm
    const checkPermission = (requiredRole: UserRole): boolean => {
        if (!currentUser) return false;

        const roleHierarchy: Record<UserRole, number> = {
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
        checkPermission,
        handleLogout
    };
} //useHomeViewModel