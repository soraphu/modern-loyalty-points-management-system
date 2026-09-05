import {
    AlertCircle,
    Coins,
    Loader2,
    RefreshCw,
    Search,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NavigationBar } from '@/components/parts/top_navigate';
import EditPointsDialog from '@/components/parts/EditPointsDialog';
import { useManageCustomersViewModel } from '../viewmodels/useManageCustomersViewModel';

export default function ManageCustomersPage() {
    const viewModel = useManageCustomersViewModel();

    if (viewModel.authLoading) {
        return <LoadingState />;
    }

    if (viewModel.admin && !viewModel.hasPermission) {
        return <AccessDenied />;
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
                            <Users className="h-5 w-5 text-blue-500" />
                            MANAGE CUSTOMERS
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            {viewModel.totalCustomers} customers in this view
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={viewModel.refreshCustomers}
                        className="self-start border-zinc-800 bg-zinc-900 text-zinc-300"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </header>

                <div className="relative max-w-lg">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                    <Input
                        value={viewModel.searchQuery}
                        onChange={(event) => viewModel.setSearchQuery(event.target.value)}
                        placeholder="Search name, LINE ID, or customer ID"
                        className="border-zinc-800 bg-zinc-900 pl-9 text-zinc-50"
                    />
                </div>

                {viewModel.error && <ErrorState message={viewModel.error} />}

                {!viewModel.error && viewModel.customers.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-900/20">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-175 text-left">
                                <thead className="border-b border-zinc-900 bg-zinc-900/60 text-xs uppercase tracking-widest text-zinc-500">
                                    <tr>
                                        <th className="p-4">Customer</th>
                                        <th className="p-4">LINE ID</th>
                                        <th className="p-4">Joined</th>
                                        <th className="p-4 text-right">Points</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-900 text-sm">
                                    {viewModel.customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-zinc-900/40">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage
                                                            src={customer.linePictureUrl ?? undefined}
                                                        />
                                                        <AvatarFallback>LN</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-semibold">
                                                        {customer.lineDisplayName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-xs text-zinc-500">
                                                {customer.lineId}
                                            </td>
                                            <td className="p-4 text-zinc-400">
                                                {new Date(customer.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right font-bold text-amber-400">
                                                {customer.totalPoints.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => viewModel.setEditingCustomer(customer)}
                                                    className="border-zinc-800"
                                                >
                                                    <Coins className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {viewModel.pageCount > 1 && (
                    <div className="flex items-center justify-between text-sm text-zinc-400">
                        <Button
                            variant="outline"
                            disabled={viewModel.page === 1}
                            onClick={() => viewModel.setPage(viewModel.page - 1)}
                        >
                            Previous
                        </Button>
                        <span>
                            Page {viewModel.page} of {viewModel.pageCount}
                        </span>
                        <Button
                            variant="outline"
                            disabled={viewModel.page === viewModel.pageCount}
                            onClick={() => viewModel.setPage(viewModel.page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}

                <EditPointsDialog
                    customer={viewModel.editingCustomer}
                    isLoading={viewModel.isUpdating}
                    onClose={() => viewModel.setEditingCustomer(null)}
                    onSubmit={viewModel.updatePoints}
                />
            </main>
        </div>
    );
}

function AccessDenied() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-center text-zinc-50">
            <div>
                <AlertCircle className="mx-auto mb-3 h-8 w-8 text-rose-400" />
                <h1 className="text-xl font-bold">Manager access required</h1>
                <p className="mt-2 text-sm text-zinc-500">
                    Your account cannot view customer management.
                </p>
            </div>
        </div>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-rose-900/50 bg-rose-950/30 p-4 text-rose-300">
            <AlertCircle className="h-5 w-5" />
            {message}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="py-16 text-center text-zinc-500">
            <Users className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
            No customers match this search.
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
    );
}
