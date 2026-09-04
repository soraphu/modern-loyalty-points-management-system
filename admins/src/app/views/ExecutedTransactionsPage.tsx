import { useExecutedTransactionsViewModel } from '../viewmodels/useExecutedTransactionsViewModel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, FileClock, Search, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownLeft, XCircle } from 'lucide-react';
import { NavigationBar } from '@/components/parts/top_navigate';

export default function ExecutedTransactionsPage() {
    const {
        transactions,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        typeFilter,
        setTypeFilter,
        refreshLogs
    } = useExecutedTransactionsViewModel();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-xs text-zinc-500 font-mono tracking-widest">LOADING TRANSACTION AUDITS...</p>
                </div>
            </div>
        );
    }

    // Pure styling helper for transaction type matching your schema values
    const getTypeBadgeStyle = (type: string) => {
        switch (type) {
            case 'EARN':
                return { bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-900', icon: <ArrowDownLeft className="h-3 w-3" /> };
            case 'CANCEL':
                return { bg: 'bg-red-950/80 text-red-400 border-red-900', icon: <XCircle className="h-3 w-3" /> };
            default: // REDEEM
                return { bg: 'bg-blue-950/80 text-blue-400 border-blue-900', icon: <ArrowUpRight className="h-3 w-3" /> };
        }
    };

    const CustomeTabTrigger = ({ value, textContent }: { value: string, textContent: string }) => {
        return (
            <TabsTrigger value={value} className="cursor-pointer hover:text-zinc-400 text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs px-3 flex-1 md:flex-none">{textContent}</TabsTrigger>
        )
    }

    return (

        <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 antialiased ">
            <NavigationBar enableReturn={true} />

            <div className="mt-4 max-w-5xl w-full mx-auto space-y-6 p-4">

                {/* HEADER SECTION */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
                    <div>
                        <h1 className="text-xl font-black tracking-wider text-white flex items-center gap-2">
                            <FileClock className="text-blue-500 h-5 w-5" /> EXECUTED TRANSACTIONS
                        </h1>
                    </div>
                    <Button
                        variant="outline"
                        onClick={refreshLogs}
                        className="bg-zinc-900 border-zinc-800 text-zinc-300 h-9 cursor-pointer hover:bg-zinc-800 self-start sm:self-auto"
                    >
                        <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh Log
                    </Button>
                </div>

                {/* FILTERS CONTROLS */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by line name, transaction or reference ID..."
                            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder-zinc-600 focus:border-blue-500 text-sm"
                        />
                    </div>

                    <Tabs value={typeFilter} onValueChange={(val) => setTypeFilter(val as any)} className="w-full md:w-auto">
                        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 text-zinc-400 w-full md:w-auto">
                            <CustomeTabTrigger value='ALL' textContent='All' />
                            <CustomeTabTrigger value='EARN' textContent='Earn' />
                            <CustomeTabTrigger value='REDEEM' textContent='Redeem' />
                            <CustomeTabTrigger value='CANCEL' textContent='Cancel' />
                        </TabsList>
                    </Tabs>
                </div>

                {/* MAIN DATA TABLE */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-950/30 border border-red-900/50 p-4 rounded-xl text-red-400 max-w-xl mx-auto">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {!error && transactions.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-zinc-900 rounded-2xl bg-zinc-900/10">
                        <FileClock className="h-8 w-8 text-zinc-800 mx-auto mb-2" />
                        <p className="text-zinc-500 font-medium text-sm">No transaction records match this query context.</p>
                    </div>
                ) : (
                    <div className="border border-zinc-900 rounded-xl overflow-hidden shadow-xl bg-zinc-900/10 backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-zinc-900/50 border-b border-zinc-900 text-zinc-400 text-[11px] font-bold tracking-widest uppercase">
                                        <th className="p-4">Transaction Details</th>
                                        <th className="p-4">Timestamp</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">LINE Customer</th>
                                        <th className="p-4">Reference Source ID</th>
                                        <th className="p-4 text-right">Impact</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-900 text-xs text-zinc-300">
                                    {transactions.map((tx) => {
                                        const badge = getTypeBadgeStyle(tx.type);
                                        return (
                                            <tr key={tx.id} className="hover:bg-zinc-900/30 transition-colors group">

                                                {/* Core Transaction ID & Operator Context */}
                                                <td className="p-4">
                                                    <div className="font-mono text-zinc-400 text-xs truncate max-w-[140px]" title={tx.id}>
                                                        #{tx.id.split('-')[0]}...
                                                    </div>
                                                </td>

                                                {/* Formatted Date & Time */}
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="font-medium text-zinc-200">
                                                        {new Date(tx.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500 mt-0.5">
                                                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>

                                                {/* Action Status Type Badge */}
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border tracking-wide font-mono ${badge.bg}`}>
                                                        {badge.icon}
                                                        {tx.type}
                                                    </span>
                                                </td>

                                                {/* Customer Image Avatar & LINE Display Name */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar className="h-7 w-7 border border-zinc-800 shrink-0">
                                                            <AvatarImage src={tx.user.linePictureUrl} alt={tx.user.lineDisplayName} />
                                                            <AvatarFallback className="bg-zinc-800 text-zinc-400 text-[9px] font-bold">LN</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-semibold text-zinc-200 truncate max-w-[120px]">
                                                            {tx.user.lineDisplayName}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Associated Reference Database ID */}
                                                <td className="p-4 font-mono text-zinc-500 max-w-[120px] truncate" title={tx.referenceId}>
                                                    {tx.referenceId}
                                                </td>

                                                {/* Real-time points Amount Delta calculation */}
                                                <td className={`p-4 text-right font-bold text-sm tracking-tight ${tx.type === 'EARN' ? 'text-emerald-400' : 'text-red-400'
                                                    }`}>
                                                    {tx.type === 'EARN' ? '+' : '-'}{tx.pointsAmount}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}