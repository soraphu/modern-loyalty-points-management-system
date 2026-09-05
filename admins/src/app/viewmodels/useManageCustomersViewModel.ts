import { useEffect, useState } from 'react';
import { apiClient } from '@/config/apiClient';
import { API_PATH, filterErrorMessage } from '@/config/constant';
import AuthAction from '@/config/authAction';
import { useAuth } from '@/config/authProvider';
import { toast } from 'sonner';
import type { Customer, CustomerListResponse } from '@/app/models/customerTypes';
import type { AdminRole } from '@/app/models/adminTypes';

const roleRank: Record<AdminRole, number> = { STAFF: 1, MANAGER: 2, OWNER: 3 };
const PAGE_SIZE = 10;

export function useManageCustomersViewModel() {
    const { admin } = useAuth();
    const { action, fetchAdminProfile } = AuthAction();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const hasPermission = !!admin && roleRank[admin.role] >= roleRank.MANAGER;
    const loadCustomers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await action(() => apiClient.get<CustomerListResponse>(API_PATH.getCustomers));
            setCustomers(response.data.data.customers);
        } catch (err: unknown) {
            const message = filterErrorMessage(err);
            setError(message.msg);
            toast.error(message.msg);
        } finally { setIsLoading(false); }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!admin) {
            setAuthLoading(true);
            fetchAdminProfile().finally(() => setAuthLoading(false));
            return;
        }
        if (hasPermission) void loadCustomers();
    }, [admin, authLoading, hasPermission]);

    const filteredCustomers = customers.filter((customer) => {
        const query = searchQuery.trim().toLowerCase();
        return !query || [customer.lineDisplayName, customer.lineId, customer.id].some((value) => value.toLowerCase().includes(query));
    });
    const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
    const visibleCustomers = filteredCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const updatePoints = async (newPoints: number) => {
        if (!editingCustomer) return;
        setIsUpdating(true);
        try {
            await action(() => apiClient.patch(API_PATH.adjustCustomerPoints(editingCustomer.id), { new_points: newPoints }));
            toast.success('Customer points updated.');
            setEditingCustomer(null);
            await loadCustomers();
        } catch (err: unknown) {
            const message = filterErrorMessage(err);
            toast.error(message.msg);
            throw err;
        } finally { setIsUpdating(false); }
    };

    return {
        admin,
        authLoading,
        hasPermission,
        customers: visibleCustomers,
        totalCustomers: filteredCustomers.length,
        isLoading,
        error,
        searchQuery,
        setSearchQuery: (value: string) => { setSearchQuery(value); setPage(1); },
        page,
        pageCount,
        setPage,
        refreshCustomers: loadCustomers,
        editingCustomer,
        setEditingCustomer,
        updatePoints,
        isUpdating
    };
}