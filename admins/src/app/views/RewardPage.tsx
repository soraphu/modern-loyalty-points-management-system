import { useRewardsViewModel } from '../viewmodels/useRewardsViewModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Gift, RefreshCw, Trash2, Search, AlertCircle } from 'lucide-react';
import { NavigationBar } from '@/components/parts/top_navigate';
import AddRewardDialog from '@/components/parts/AddRewardDialog';

export default function RewardsPage() {
    const {
        rewards,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        hasWritePermission,
        handleToggleStatus,
        handleDeleteReward,
        refreshRewards,
    } = useRewardsViewModel();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-xs text-zinc-500 font-mono tracking-widest">LOADING REWARDS...</p>
                </div>
            </div>
        );
    }

    const getStatusStyle = (active: boolean) => {
        return active
            ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
            : 'bg-zinc-800 text-zinc-400 border-zinc-700';
    };

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 antialiased">
            <NavigationBar />

            <div className="mt-4 max-w-6xl w-full mx-auto space-y-6 p-4">

                {/* HEADER CONTROL FRAMEWORK */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
                    <div>
                        <h1 className="text-xl font-black tracking-wider text-white flex items-center gap-2">
                            <Gift className="text-blue-500 h-5 w-5" /> ALL REWARDS
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={refreshRewards} className="bg-zinc-900 border-zinc-800 text-zinc-300 cursor-pointer h-9 hover:bg-zinc-800">
                            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
                        </Button>

                        {hasWritePermission && <AddRewardDialog onSuccess={refreshRewards} />}
                    </div>
                </div>

                {/* SEARCH INPUT & FILTER TABS */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by reward name..."
                            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder-zinc-600 focus-visible:ring-blue-500 text-sm"
                        />
                    </div>

                    <Tabs value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)} className="w-full md:w-auto">
                        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 text-zinc-400 w-full md:w-auto">
                            <TabsTrigger value="ALL" className="cursor-pointer hover:text-zinc-400 text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs px-3 flex-1 md:flex-none">All</TabsTrigger>
                            <TabsTrigger value="ACTIVE" className="cursor-pointer hover:text-zinc-400 text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs px-3 flex-1 md:flex-none">Active</TabsTrigger>
                            <TabsTrigger value="INACTIVE" className="cursor-pointer hover:text-zinc-400 text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs px-3 flex-1 md:flex-none">Inactive</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* ERROR STATE */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-950/30 border border-red-900/50 p-4 rounded-xl text-red-400 max-w-xl mx-auto">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!error && rewards.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                        <Gift className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-400 text-sm font-medium">No rewards found</p>
                        <p className="text-zinc-600 text-xs mt-1">Try adjusting your search query or filter.</p>
                    </div>
                )}

                {/* MAIN RENDERING GRID */}
                {rewards.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {rewards.map((item) => (
                            <Card key={item.id} className="bg-zinc-900/40 border-zinc-900 overflow-hidden flex flex-col hover:border-zinc-800 transition-all group shadow-md">

                                <div className="relative aspect-video w-full border-b border-zinc-900 bg-zinc-950 flex items-center justify-center overflow-hidden">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.rewardName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Gift className="h-8 w-8 text-zinc-800" />
                                    )}

                                    <span className={`absolute top-2 right-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded border tracking-wider font-mono shadow-md ${getStatusStyle(item.active)}`}>
                                        {item.active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>

                                <CardHeader className="p-4 space-y-1.5 flex-1 min-w-0">
                                    <CardTitle className="text-sm font-bold text-white truncate">{item.rewardName}</CardTitle>
                                </CardHeader>

                                <CardContent className="px-4 pb-4 pt-0">
                                    <div className="flex items-baseline gap-1 bg-zinc-900/60 rounded-lg p-2.5 border border-zinc-900/80">
                                        <span className="text-lg font-black text-blue-400 tracking-tight">{item.pointsCost}</span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Points</span>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-3 bg-zinc-900/20 border-t border-zinc-900 gap-2 mt-auto min-h-[53px]">
                                    {hasWritePermission ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleToggleStatus(item.id, item.active)}
                                                className={`flex-1 text-xs h-8 cursor-pointer font-medium ${item.active
                                                    ? 'border-red-950/60 text-red-400 hover:bg-red-950/40'
                                                    : 'border-emerald-950/60 text-emerald-400 hover:bg-emerald-950/40'
                                                    }`}
                                            >
                                                {item.active ? 'Deactivate' : 'Activate'}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={() => handleDeleteReward(item.id)}
                                                className="border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 px-2.5 h-8 cursor-pointer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="w-full text-center py-1 text-[11px] text-zinc-600 font-medium italic tracking-wide">
                                            Read-Only Access Mode
                                        </div>
                                    )}
                                </CardFooter>

                            </Card>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}