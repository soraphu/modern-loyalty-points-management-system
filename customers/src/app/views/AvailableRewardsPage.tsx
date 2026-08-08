import { useAvailableRewardsViewModel, type Reward } from "../viewmodels/useAvailableRewardsViewModel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/config/AuthContext";
import GeneralNavbar from "@/components/GeneralNavbar";

export function AvailableRewardsPage() {
    const {
        rewards,
        isLoading,
        error,
        selectedReward,
        isRedeeming,
        isModalOpen,
        fetchRewards,
        handleOpenRedeemModal,
        handleCloseModal,
        handleConfirmRedeem,
    } = useAvailableRewardsViewModel();
    const { profile } = useAuth();
    const userPoints = profile?.totalPoints;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            {/* Header */}
            <GeneralNavbar backgroundColor="bg-[#b40404]" title='Available Rewards' logo={<Gift className="text-white h-6 w-6" />} />


            {/* Main Container */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">

                {/* Loading Skeletons */}
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                            <Card key={i} className="rounded-3xl border-0 shadow-md overflow-hidden">
                                <Skeleton className="h-40 w-full" />
                                <CardHeader className="p-4">
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                </CardHeader>
                                <CardFooter className="p-4 pt-0">
                                    <Skeleton className="h-10 w-full rounded-2xl" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Error View */}
                {!isLoading && error && (
                    <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center my-8 space-y-3">
                        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
                        <p className="text-red-700 font-medium">{error}</p>
                        <Button onClick={fetchRewards} variant="outline" className="rounded-2xl border-red-200 text-red-700 hover:bg-red-100">
                            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && rewards.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-zinc-200 p-8">
                        <Gift className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-zinc-800">No Rewards Available</h3>
                        <p className="text-zinc-500 text-sm mt-1">Check back later for new vouchers!</p>
                    </div>
                )}

                {/* Rewards List */}
                {!isLoading && !error && rewards.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {rewards.map((reward: Reward) => {
                            const canAfford = userPoints ? userPoints >= reward.pointsCost : false;

                            return (
                                <Card key={reward.id} className="flex flex-col justify-between rounded-3xl border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden bg-white">
                                    <div>
                                        {/* Image / Fallback Placeholder */}
                                        <div className="h-40 w-full bg-slate-100 relative flex items-center justify-center overflow-hidden">
                                            {reward.imageUrl ? (
                                                <img src={reward.imageUrl} alt={reward.rewardName} className="w-full h-full object-cover" />
                                            ) : (
                                                <Gift className="h-12 w-12 text-slate-300" />
                                            )}

                                            {/* Points Cost Badge */}
                                            <Badge className="absolute top-3 right-3 bg-zinc-900 text-white font-bold rounded-xl px-3 py-1">
                                                {reward.pointsCost} {reward.pointsCost === 1 ? "PT" : "PTS"}
                                            </Badge>
                                        </div>

                                        <CardHeader className="p-4">
                                            {/* Real Field Name: rewardName */}
                                            <CardTitle className="text-lg font-black text-zinc-900">{reward.rewardName}</CardTitle>
                                        </CardHeader>
                                    </div>

                                    <CardFooter className="p-4 pt-0">
                                        <Button
                                            onClick={() => handleOpenRedeemModal(reward)}
                                            disabled={!canAfford || !reward.active}
                                            className={`w-full rounded-2xl py-5 font-bold transition-all active:scale-[0.98] cursor-pointer ${canAfford && reward.active
                                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                                }`}
                                        >
                                            {reward.active
                                                ? canAfford
                                                    ? "Redeem Reward"
                                                    : "Insufficient Points"
                                                : "Unavailable"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmRedeem}
                isLoading={isRedeeming}
                variant="emerald"
                title={`Redeem ${selectedReward?.rewardName}?`}
                description={`This action will deduct ${selectedReward?.pointsCost} point(s) from your balance. Are you sure you want to proceed?`}
                confirmText="Confirm Redemption"
                cancelText="Cancel"
            />
        </div>
    );
}