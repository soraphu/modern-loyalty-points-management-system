import { useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../models/homeTypes';

export function useHomeViewModel() {
    // Mocking the active user session. In production, this can come from your Auth Context!
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Setting browser tab title metadata
        document.title = 'ADMIN OF DEEPOINTS';

        // Simulate reading current user profile session data
        setTimeout(() => {
            setCurrentUser({
                id: 'usr_9921',
                username: 'johndoe_admin',
                firstname: 'John',
                lastname: 'Doe',
                role: 'OWNER', // 👈 Change to 'MANAGER' or 'OWNER' to test dynamic button renderings!
            });
            setIsLoading(false);
        }, 400);
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
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    };

    return {
        currentUser,
        isLoading,
        checkPermission,
        handleLogout
    };
}