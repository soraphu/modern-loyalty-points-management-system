import { useState } from 'react';
import {
    AlertCircle,
    KeyRound,
    Loader2,
    RefreshCw,
    Search,
    Shield,
    Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NavigationBar } from '@/components/parts/top_navigate';
import { ConfirmDialog } from '@/components/parts/ConfirmDialog';
import AddAdminDialog from '@/components/parts/AddAdminDialog';
import ResetAdminPasswordDialog from '@/components/parts/ResetAdminPasswordDialog';
import { useManageAdminViewModel } from '../viewmodels/useManageAdminViewModel';
import type { AdminRole, ManagedAdmin } from '../models/adminTypes';

export default function ManageAdminPage() {
    const viewModel = useManageAdminViewModel();
    const [deletingAdmin, setDeletingAdmin] = useState<ManagedAdmin | null>(null);

    if (viewModel.authLoading) {
        return <LoadingState />;
    }

    if (viewModel.admin && !viewModel.hasPermission) {
        return <AccessDeniedState />;
    }

    if (viewModel.isLoading) {
        return <LoadingState />;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50">
            <NavigationBar enableReturn={true} />

            <main className="mx-auto mt-4 w-full max-w-6xl space-y-6 p-4">
                <header className="flex flex-col gap-4 border-b border-zinc-900 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-black tracking-wider">
                            <Shield className="h-5 w-5 text-blue-500" />
                            MANAGE ADMINS
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            Owner-controlled access directory
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={viewModel.refreshAdmins}
                            className="border-zinc-800 bg-zinc-900"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <AddAdminDialog
                            isLoading={viewModel.isMutating}
                            onSubmit={viewModel.createAdmin}
                        />
                    </div>
                </header>

                <div className="relative max-w-lg">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                    <Input
                        value={viewModel.searchQuery}
                        onChange={(event) => viewModel.setSearchQuery(event.target.value)}
                        placeholder="Search username, name, or role"
                        className="border-zinc-800 bg-zinc-900 pl-9 text-zinc-50"
                    />
                </div>

                {viewModel.error && (
                    <div className="flex items-center gap-3 rounded-xl border border-rose-900/50 bg-rose-950/30 p-4 text-rose-300">
                        <AlertCircle className="h-5 w-5" />
                        {viewModel.error}
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-900/20">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-190 text-left">
                            <thead className="border-b border-zinc-900 bg-zinc-900/60 text-xs uppercase tracking-widest text-zinc-500">
                                <tr>
                                    <th className="p-4">Admin</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Updated</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900 text-sm">
                                {viewModel.admins.map((item) => (
                                    <AdminRow
                                        key={item.id}
                                        admin={item}
                                        disabled={viewModel.isMutating}
                                        onRoleChange={viewModel.updateRole}
                                        onReset={() => viewModel.setResettingAdmin(item)}
                                        onDelete={() => setDeletingAdmin(item)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ResetAdminPasswordDialog
                    admin={viewModel.resettingAdmin}
                    isLoading={viewModel.isMutating}
                    onClose={() => viewModel.setResettingAdmin(null)}
                    onSubmit={viewModel.resetPassword}
                />

                <ConfirmDialog
                    isOpen={!!deletingAdmin}
                    onClose={() => setDeletingAdmin(null)}
                    isLoading={viewModel.isMutating}
                    title="Delete admin account"
                    description={`Permanently delete @${deletingAdmin?.username} from the admin directory? This cannot be undone.`}
                    confirmText="Delete"
                    variant="destructive"
                    onConfirm={async () => {
                        if (deletingAdmin) {
                            await viewModel.deleteAdmin(deletingAdmin.id);
                        }
                    }}
                />
            </main>
        </div>
    );
}

function AdminRow({
    admin,
    disabled,
    onRoleChange,
    onReset,
    onDelete,
}: {
    admin: ManagedAdmin;
    disabled: boolean;
    onRoleChange: (id: string, role: AdminRole) => Promise<void>;
    onReset: () => void;
    onDelete: () => void;
}) {
    const [role, setRole] = useState(admin.role);

    const handleRoleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextRole = event.target.value as AdminRole;
        setRole(nextRole);
        await onRoleChange(admin.id, nextRole);
    };

    return (
        <tr className="hover:bg-zinc-900/40">
            <td className="p-4">
                <div className="font-semibold">
                    {admin.firstname} {admin.lastname}
                </div>
                <div className="text-xs text-zinc-500">@{admin.username}</div>
            </td>
            <td className="p-4">
                {
                    role === "OWNER" ?
                        <div className="rounded-2xl border px-2 py-1 text-xs text-yellow-400 max-w-26 text-center">
                            {role}
                        </div>
                        :
                        <select
                            value={role}
                            onChange={handleRoleChange}
                            className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-sm"
                        >
                            <option>STAFF</option>
                            <option>MANAGER</option>
                        </select>
                }
            </td>
            <td className="p-4">
                <span className="rounded border border-emerald-900 bg-emerald-950/50 px-2 py-1 text-xs text-emerald-400">
                    {admin.status}
                </span>
            </td>
            <td className="p-4 text-zinc-400">
                {new Date(admin.updatedAt).toLocaleDateString()}
            </td>
            <td className="p-4">
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={disabled}
                        onClick={onReset}
                        className="border-zinc-800"
                    >
                        <KeyRound className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        disabled={disabled || admin.role === 'OWNER'}
                        onClick={onDelete}
                        className="border-rose-900/50 text-rose-400"
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </td>
        </tr>
    );
}

function LoadingState() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
    );
}

function AccessDeniedState() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-center text-zinc-50">
            <div>
                <AlertCircle className="mx-auto mb-3 h-8 w-8 text-rose-400" />
                <h1 className="text-xl font-bold">Owner access required</h1>
                <p className="mt-2 text-sm text-zinc-500">
                    Only the owner can manage admin accounts.
                </p>
            </div>
        </div>
    );
}
