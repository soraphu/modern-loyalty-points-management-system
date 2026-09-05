import { useEffect, useState } from 'react';
import { apiClient } from '@/config/apiClient';
import { API_PATH, filterErrorMessage } from '@/config/constant';
import AuthAction from '@/config/authAction';
import { useAuth } from '@/config/authProvider';
import { toast } from 'sonner';
import type { AdminRole, ManagedAdmin } from '@/app/models/adminTypes';
import type { NewAdminForm } from '@/components/parts/AddAdminDialog';

interface AdminListResponse {
    data: {
        admins: Omit<ManagedAdmin, 'status'>[];
    };
}

export function useManageAdminViewModel() {
    const { admin } = useAuth();
    const { action, fetchAdminProfile } = AuthAction();
    const [admins, setAdmins] = useState<ManagedAdmin[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMutating, setIsMutating] = useState(false);
    const [resettingAdmin, setResettingAdmin] = useState<ManagedAdmin | null>(null);

    const hasPermission = admin?.role === 'OWNER';

    const loadAdmins = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await action(() =>
                apiClient.get<AdminListResponse>(API_PATH.getAdmins),
            );

            setAdmins(
                response.data.data.admins.map((item) => ({
                    ...item,
                    status: 'ACTIVE',
                })),
            );
        } catch (err: unknown) {
            const message = filterErrorMessage(err);
            setError(message.msg);
            toast.error(message.msg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!admin) {
            setAuthLoading(true);
            fetchAdminProfile().finally(() => setAuthLoading(false));
            return;
        }

        if (hasPermission) {
            void loadAdmins();
        }
    }, [admin, authLoading, hasPermission]);

    const runMutation = async (
        request: () => Promise<unknown>,
        successMessage: string,
    ) => {
        setIsMutating(true);

        try {
            await action(request);
            toast.success(successMessage);
            await loadAdmins();
        } catch (err: unknown) {
            const message = filterErrorMessage(err);
            toast.error(message.msg);
            throw err;
        } finally {
            setIsMutating(false);
        }
    };

    const createAdmin = (form: NewAdminForm) =>
        runMutation(
            () => apiClient.post(API_PATH.createAdmin, form),
            'Admin account created.',
        );

    const updateRole = (adminId: string, role: AdminRole) =>
        runMutation(
            () =>
                apiClient.patch(API_PATH.adjustAdminRole(adminId), {
                    new_role: role,
                }),
            'Admin role updated.',
        );

    const resetPassword = async (password: string) => {
        if (!resettingAdmin) {
            return;
        }

        await runMutation(
            () =>
                apiClient.patch(API_PATH.resetAdminPassword(resettingAdmin.id), {
                    new_password: password,
                }),
            'Admin password reset.',
        );

        setResettingAdmin(null);
    };

    const deleteAdmin = (adminId: string) =>
        runMutation(
            () => apiClient.delete(API_PATH.deleteAdmin(adminId)),
            'Admin account deactivated.',
        );

    const normalizedSearchQuery = searchQuery.toLowerCase();
    const filteredAdmins = admins.filter((item) =>
        `${item.username} ${item.firstname} ${item.lastname} ${item.role}`
            .toLowerCase()
            .includes(normalizedSearchQuery),
    );

    return {
        admin,
        authLoading,
        hasPermission,
        admins: filteredAdmins,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        refreshAdmins: loadAdmins,
        createAdmin,
        updateRole,
        resetPassword,
        deleteAdmin,
        resettingAdmin,
        setResettingAdmin,
        isMutating,
    };
}
