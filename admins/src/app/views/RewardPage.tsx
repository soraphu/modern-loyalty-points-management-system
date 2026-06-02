import { useRewardsViewModel } from '../viewmodels/useRewardsViewModel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Gift, Search, RefreshCw, AlertCircle, Plus } from 'lucide-react';

export default function RewardsPage() {
    const {
        rewards,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        refreshRewards,
    } = useRewardsViewModel();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-xs text-zinc-500 font-medium tracking-wider">LOADING REWARDS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 antialiased p-6">
            <div className="max-w-6xl w-full mx-auto space-y-6">

                {/* ==========================================
            HEADER CONTROL FRAME WORK
            ========================================== */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                            <Gift className="text-blue-500 h-6 w-6" /> ALL REWARDS MARGIN
                        </h1>
                        <p className="text-xs text-zinc-400 mt-1">
                            Manage inventory rewards, point cost weights, and store availability status.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={refreshRewards}
                            className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 h-9 cursor-pointer"
                        >
                            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9 font-medium text-sm gap-1.5 cursor-pointer">
                            <Plus className="h-4 w-4" /> Add Reward
                        </Button>
                    </div>
                </div>

                {/* ==========================================
            FILTER BAR TOOL CHAIN
            ========================================== */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search rewards by name..."
                            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder-zinc-600 focus:border-blue-500"
                        />
                    </div>

                    <Tabs
                        value={statusFilter}
                        onValueChange={(val) => setStatusFilter(val as any)}
                        className="w-full md:w-auto"
                    >
                        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 text-zinc-400">
                            <TabsTrigger value="ALL" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs px-4">All</TabsTrigger>
                            <TabsTrigger value="ACTIVE" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs px-4">Active</TabsTrigger>
                            <TabsTrigger value="INACTIVE" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs px-4">Inactive</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* ==========================================
            MAIN RENDERING CANVAS BLOCKS
            ========================================== */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-950/30 border border-red-900/50 p-4 rounded-xl text-red-400 max-w-xl mx-auto">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <div className="text-sm font-medium">{error}</div>
                    </div>
                )}

                {!error && rewards.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-zinc-900 rounded-2xl bg-zinc-900/10">
                        <Gift className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                        <h3 className="text-zinc-400 font-semibold tracking-wide">No Rewards Listed</h3>
                        <p className="text-xs text-zinc-600 mt-1">Try tweaking your search inputs or add a new catalogue item.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {rewards.map((item) => (
                            <Card key={item.id} className="bg-zinc-900/40 border-zinc-900 overflow-hidden flex flex-col hover:border-zinc-800 transition-all group shadow-md">

                                {/* Reward Preview Core Box Image */}
                                <div className="relative aspect-video w-full border-b border-zinc-900 bg-zinc-950 flex items-center justify-center overflow-hidden">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.rewardName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <Gift className="h-8 w-8 text-zinc-800 group-hover:text-zinc-700 transition-colors" />
                                    )}

                                    {/* Status Overlay Float Tag */}
                                    <span className={`absolute top-2 right-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded border tracking-wider font-mono shadow-md ${item.active
                                        ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                        }`}>
                                        {item.active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>

                                <CardHeader className="p-4 space-y-1.5 flex-1 min-w-0">
                                    <p className="text-[10px] text-zinc-500 font-mono font-bold tracking-wider uppercase">
                                        ISSUED: {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                    <CardTitle className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                        {item.rewardName}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="px-4 pb-4 pt-0">
                                    <div className="flex items-baseline gap-1 bg-zinc-900/60 rounded-lg p-2.5 border border-zinc-900/80">
                                        <span className="text-lg font-black text-blue-400 tracking-tight">{item.pointsCost}</span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Points Needed</span>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-3 bg-zinc-900/20 border-t border-zinc-900 gap-2 mt-auto">
                                    <Button variant="ghost" className="flex-1 text-xs h-8 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer">
                                        Edit Info
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className={`flex-1 text-xs h-8 cursor-pointer ${item.active
                                            ? 'border-red-900/40 text-red-400 bg-red-950/20 hover:bg-red-950'
                                            : 'border-emerald-900/40 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950'
                                            }`}
                                    >
                                        {item.active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </CardFooter>

                            </Card>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}