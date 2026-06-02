import { useRewardsViewModel } from '../viewmodels/useRewardsViewModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Gift, RefreshCw, Plus, Trash2 } from 'lucide-react';

export default function RewardsPage() {
    const {
        rewards,
        isLoading,
        hasWritePermission, // 💡 Check authorization state
        handleToggleStatus,
        handleDeleteReward,
        refreshRewards,
    } = useRewardsViewModel();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const getStatusStyle = (active: boolean) => {
        return active
            ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
            : 'bg-zinc-800 text-zinc-400 border-zinc-700';
    };

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 antialiased p-6">
            <div className="max-w-6xl w-full mx-auto space-y-6">

                {/* HEADER CONTROL FRAME WORK */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                            <Gift className="text-blue-500 h-6 w-6" /> ALL REWARDS
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={refreshRewards} className="bg-zinc-900 border-zinc-800 text-zinc-300 cursor-pointer h-9">
                            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
                        </Button>

                        {/* 💡 CONDITIONAL: Hide "Add Reward" option if user is basic STAFF */}
                        {hasWritePermission && (
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm gap-1.5 cursor-pointer h-9 animate-in fade-in duration-200">
                                <Plus className="h-4 w-4" /> Add Reward
                            </Button>
                        )}
                    </div>
                </div>

                {/* ... (Search input and filter tabs remain the same) */}

                {/* MAIN RENDERING GRID */}
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

                            {/* ==========================================
                  💡 RESPONSIBLE ACTION FOOTER MANAGEMENT
                  ========================================== */}
                            <CardFooter className="p-3 bg-zinc-900/20 border-t border-zinc-900 gap-2 mt-auto min-h-[53px]">
                                {hasWritePermission ? (
                                    <>
                                        {/* Full Access Operations Render for MANAGER or OWNER */}
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
                                    /* Read-Only Status Display for regular STAFF */
                                    <div className="w-full text-center py-1 text-[11px] text-zinc-600 font-medium italic tracking-wide">
                                        Read-Only Access Mode
                                    </div>
                                )}
                            </CardFooter>

                        </Card>
                    ))}
                </div>

            </div>
        </div>
    );
}