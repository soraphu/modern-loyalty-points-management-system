import React from 'react';
import { usePendingViewModel } from '../viewmodels/usePendingViewModel';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import GeneralNavbar from '@/components/GeneralNavbar';
import {
    Ticket,
    Gift,
    RefreshCw,
    Clock,
    Copy,
    Check,
    AlertCircle,
    ArrowRight,
    QrCode,
} from 'lucide-react';
import type { PendingVoucher } from '@/types/pending';

export function PendingPage(): React.ReactElement {
    const {
        vouchers,
        isLoading,
        isRefreshing,
        error,
        selectedVoucher,
        isModalOpen,
        copiedCode,
        fetchPendingVouchers,
        handleOpenVoucherModal,
        handleCloseModal,
        handleCopyCode,
    } = usePendingViewModel();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50 font-sans pb-12">
            {/* Top Navigation Bar */}
            <GeneralNavbar
                backgroundColor="bg-[#dd9e00]"
                title="Pending Vouchers"
                logo={<Ticket className="text-white h-6 w-6" />}
            />

            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-4">
                {/* Header Summary & Refresh Action */}
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h2 className="text-lg font-black text-zinc-900 tracking-tight">Active Unclaimed Vouchers</h2>
                        <p className="text-xs text-zinc-500 font-medium">
                            Present your voucher code to store staff during checkout
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchPendingVouchers(true)}
                        disabled={isRefreshing}
                        className="rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 active:scale-95 transition-all text-xs font-bold gap-1.5 cursor-pointer disabled:opacity-60"
                        title="Refresh pending vouchers"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </Button>
                </div>

                {/* ==========================================
                    ⏳ LOADING SKELETON STATE
                   ========================================== */}
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="rounded-3xl border-0 shadow-md overflow-hidden bg-white p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                                <Skeleton className="h-12 w-full rounded-2xl" />
                                <Skeleton className="h-10 w-full rounded-2xl" />
                            </Card>
                        ))}
                    </div>
                )}

                {/* ==========================================
                    ❌ ERROR STATE
                   ========================================== */}
                {!isLoading && error && (
                    <Card className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center space-y-3">
                        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
                        <p className="text-rose-700 font-semibold text-sm">{error}</p>
                        <Button
                            onClick={() => fetchPendingVouchers(true)}
                            variant="outline"
                            className="rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs"
                        >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Try Again
                        </Button>
                    </Card>
                )}

                {/* ==========================================
                    📭 EMPTY STATE
                   ========================================== */}
                {!isLoading && !error && vouchers.length === 0 && (
                    <Card className="text-center py-12 px-6 bg-white rounded-3xl border border-dashed border-zinc-200 space-y-4">
                        <div className="p-4 bg-amber-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                            <Ticket className="h-10 w-10 text-amber-500" />
                        </div>
                        <div className="space-y-1 max-w-sm mx-auto">
                            <h3 className="text-lg font-black text-zinc-800 tracking-tight">No Pending Vouchers</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                You don't have any active unclaimed vouchers at the moment. Redeem exciting rewards from our catalog using your points!
                            </p>
                        </div>
                        <Link to="/available-rewards">
                            <Button className="bg-[#dd9e00] hover:bg-[#b38000] active:scale-95 text-white rounded-2xl px-6 py-5 font-bold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer">
                                <span>Browse Available Rewards</span>
                                <ArrowRight className="h-4 w-4 ml-1.5" />
                            </Button>
                        </Link>
                    </Card>
                )}

                {/* ==========================================
                    📋 PENDING VOUCHERS LIST
                   ========================================== */}
                {!isLoading && !error && vouchers.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {vouchers.map((voucher: PendingVoucher) => {
                            const formattedCreatedDate = new Date(voucher.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            });

                            const formattedExpiry = voucher.expiresAt
                                ? new Date(voucher.expiresAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })
                                : null;

                            return (
                                <Card
                                    key={voucher.id}
                                    className="flex flex-col justify-between rounded-3xl border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden bg-white group"
                                >
                                    <div>
                                        {/* Header Info */}
                                        <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between gap-3 space-y-0">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Reward Image / Icon */}
                                                <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {voucher.reward?.imageUrl ? (
                                                        <img
                                                            src={voucher.reward.imageUrl}
                                                            alt={voucher.reward.rewardName}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <Gift className="h-7 w-7 text-amber-500" />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <CardTitle className="text-base font-black text-zinc-900 truncate">
                                                        {voucher.reward?.rewardName || 'Reward Voucher'}
                                                    </CardTitle>
                                                    <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                                                        Claimed on {formattedCreatedDate}
                                                    </p>
                                                </div>
                                            </div>

                                            <Badge
                                                variant="secondary"
                                                className="bg-amber-100 text-amber-800 border-amber-300 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase shrink-0"
                                            >
                                                Pending
                                            </Badge>
                                        </CardHeader>

                                        {/* Voucher Code Box */}
                                        <CardContent className="px-4 py-2">
                                            <div className="bg-amber-50/70 border border-dashed border-amber-300/80 rounded-2xl p-3 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[9px] uppercase tracking-wider font-bold text-amber-800/60">
                                                        Voucher Code
                                                    </p>
                                                    <p className="text-lg font-mono font-black text-amber-900 tracking-wider">
                                                        {voucher.voucherCode}
                                                    </p>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCopyCode(voucher.voucherCode)}
                                                    className="h-9 px-3 rounded-xl text-amber-800 hover:bg-amber-100 active:scale-90 transition-all font-bold text-xs cursor-pointer"
                                                    title="Copy voucher code"
                                                >
                                                    {copiedCode === voucher.voucherCode ? (
                                                        <>
                                                            <Check className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                                                            <span className="text-emerald-700">Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-3.5 w-3.5 mr-1" />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            {formattedExpiry && (
                                                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-500 font-medium">
                                                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                                                    <span>Valid until: {formattedExpiry}</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </div>

                                    {/* Action Footer */}
                                    <CardFooter className="p-4 pt-2">
                                        <Button
                                            onClick={() => handleOpenVoucherModal(voucher)}
                                            className="w-full bg-[#dd9e00] hover:bg-[#b38000] active:scale-[0.98] text-white rounded-2xl py-5 font-bold text-sm shadow-md shadow-amber-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <QrCode className="h-4 w-4" />
                                            <span>Show to Staff</span>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* ==========================================
                🎟️ VOUCHER PRESENTATION MODAL
               ========================================== */}
            <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
                <DialogContent className="max-w-sm rounded-[2rem] p-6 bg-white border-0 gap-5 shadow-2xl">
                    <DialogHeader className="text-center sm:text-center">
                        <div className="p-3 bg-amber-50 rounded-2xl w-14 h-14 mx-auto mb-2 flex items-center justify-center border border-amber-100">
                            <Ticket className="h-7 w-7 text-amber-600" />
                        </div>
                        <DialogTitle className="text-xl font-black tracking-tight text-zinc-900">
                            {selectedVoucher?.reward?.rewardName || 'Reward Voucher'}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 text-xs mt-1">
                            Present this 6-character voucher code to store staff to claim your reward.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Voucher Large Code Callout */}
                    <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-3xl p-5 text-center space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700/70">
                            Cashier Redemption Code
                        </p>
                        <div className="text-3xl font-mono font-black text-amber-950 tracking-widest">
                            {selectedVoucher?.voucherCode}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectedVoucher && handleCopyCode(selectedVoucher.voucherCode)}
                            className="mt-1 h-8 px-3 rounded-xl text-amber-800 hover:bg-amber-100 text-xs font-bold active:scale-95 transition-all"
                        >
                            {copiedCode === selectedVoucher?.voucherCode ? (
                                <>
                                    <Check className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                                    <span className="text-emerald-700">Code Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5 mr-1" />
                                    <span>Copy Code</span>
                                </>
                            )}
                        </Button>
                    </div>

                    {selectedVoucher?.expiresAt && (
                        <div className="text-center text-[11px] text-zinc-400 font-medium">
                            Expires on {new Date(selectedVoucher.expiresAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    )}

                    <DialogFooter className="flex flex-col sm:flex-col gap-2">
                        <Button
                            onClick={handleCloseModal}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl py-5 font-bold text-sm cursor-pointer"
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Footer */}
            <footer className="w-full py-4 text-center">
                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    Powered by Deepoints Architecture • 2026
                </p>
            </footer>
        </div>
    );
}

export default PendingPage;
