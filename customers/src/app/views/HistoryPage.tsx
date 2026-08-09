import {
    ArrowLeft,
    PlusCircle,
    MinusCircle,
    RotateCcw,
    Clock,
    Coins,
    History
} from "lucide-react";

import { useHistoryViewModel } from "@/app/viewmodels/useHistoryViewModel";
import { type TransactionType } from "@/app/viewmodels/useHistoryViewModel";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import GeneralNavbar from "@/components/GeneralNavbar";

// Config per transaction type
const TRANSACTION_CONFIG: Record<
    TransactionType,
    { label: string; icon: any; colorClass: string; textClass: string; prefix: string }
> = {
    EARN: {
        label: "Points Earned",
        icon: PlusCircle,
        colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
        textClass: "text-emerald-600",
        prefix: "+",
    },
    REDEEM: {
        label: "Reward Redemption",
        icon: MinusCircle,
        colorClass: "text-rose-600 bg-rose-50 border-rose-200",
        textClass: "text-slate-900",
        prefix: "-",
    },
    CANCEL: {
        label: "Redemption Cancelled",
        icon: RotateCcw,
        colorClass: "text-blue-600 bg-blue-50 border-blue-200",
        textClass: "text-blue-600",
        prefix: "+",
    },
    EXPIRED: {
        label: "Points Expired",
        icon: Clock,
        colorClass: "text-zinc-500 bg-zinc-100 border-zinc-200",
        textClass: "text-zinc-500",
        prefix: "-",
    },
};

export function HistoryPage() {
    const {
        transactions,
        isLoading,
        error,
        activeFilter,
        setActiveFilter,
        refetch,
    } = useHistoryViewModel();

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Top Header */}
            <GeneralNavbar backgroundColor="bg-[#545454]" logo={<History className="text-white" />} title="History" />

            <main className="max-w-xl mx-auto px-4 mt-5 space-y-4">
                {/* Filter Tabs */}
                <Tabs
                    defaultValue="ALL"
                    value={activeFilter}
                    onValueChange={(val) => setActiveFilter(val as TransactionType | "ALL")}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-5 rounded-2xl bg-slate-200/70 p-1">
                        <TabsTrigger value="ALL" className="rounded-xl text-xs font-bold">
                            All
                        </TabsTrigger>
                        <TabsTrigger value="EARN" className="rounded-xl text-xs font-bold">
                            Earn
                        </TabsTrigger>
                        <TabsTrigger value="REDEEM" className="rounded-xl text-xs font-bold">
                            Redeem
                        </TabsTrigger>
                        <TabsTrigger value="CANCEL" className="rounded-xl text-xs font-bold">
                            Cancel
                        </TabsTrigger>
                        <TabsTrigger value="EXPIRED" className="rounded-xl text-xs font-bold">
                            Expire
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Card key={i} className="rounded-2xl border-none shadow-sm">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-2xl" />
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-3 w-36" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-5 w-14 rounded-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {!isLoading && error && (
                    <Card className="rounded-3xl border-rose-200 bg-rose-50/50 p-6 text-center">
                        <p className="text-sm font-semibold text-rose-600 mb-3">{error}</p>
                        <Button
                            onClick={refetch}
                            variant="outline"
                            className="rounded-xl border-rose-300 text-rose-700 hover:bg-rose-100"
                        >
                            Try Again
                        </Button>
                    </Card>
                )}

                {/* Empty State */}
                {!isLoading && !error && transactions.length === 0 && (
                    <Card className="rounded-3xl border-dashed border-slate-300 p-8 text-center bg-white/60">
                        <div className="flex flex-col items-center gap-2">
                            <Coins className="h-12 w-12 text-slate-300" />
                            <p className="text-base font-bold text-slate-700">No transactions found</p>
                            <p className="text-xs text-slate-400">
                                There are no transaction records under this filter.
                            </p>
                        </div>
                    </Card>
                )}

                {/* Transactions List */}
                {!isLoading && !error && transactions.length > 0 && (
                    <div className="space-y-2.5">
                        {transactions.map((tx) => {
                            const config = TRANSACTION_CONFIG[tx.type];
                            const IconComponent = config.icon;

                            const formattedDate = new Date(tx.createdAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            });

                            // Take absolute value to prevent double negative sign (e.g. --1)
                            const displayAmount = Math.abs(tx.pointsAmount);

                            return (
                                <Card
                                    key={tx.id}
                                    className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-shadow bg-white"
                                >
                                    <CardContent className="p-3.5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-2xl border ${config.colorClass}`}>
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">
                                                    {config.label}
                                                </p>
                                                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                                                    {formattedDate}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className={`text-base font-black ${config.textClass}`}>
                                                {config.prefix}{displayAmount} {displayAmount === 1 ? "pt" : "pts"}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}