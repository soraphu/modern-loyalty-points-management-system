import { useFindVoucherViewModel } from '../viewmodels/useFindVoucherViewModel';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search, Ticket, Calendar, Ban, CheckCircle2, AlertCircle } from 'lucide-react';
import { NavigateButtonUI } from '@/components/parts/navigate_button_ui';

export default function FindVoucherDialog() {
    const {
        isOpen,
        toggleDialog,
        code,
        setCode,
        isLoading,
        error,
        voucher,
        handleFetchVoucher,
    } = useFindVoucherViewModel();

    // Helper badge layout styling matching status states
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'USED': return 'bg-amber-950 text-amber-400 border-amber-900';
            case 'CANCELLED': return 'bg-red-950/60 text-red-400 border-red-900';
            case 'EXPIRED': return 'bg-zinc-800 text-zinc-400 border-zinc-700';
            default: return 'bg-emerald-950 text-emerald-400 border-emerald-900';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={toggleDialog}>
            <DialogTrigger asChild>
                <NavigateButtonUI Icon={Ticket} title='Find Voucher' useColor='STAFF' />
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-900 text-zinc-50 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Ticket className="text-blue-500 h-5 w-5" /> Find Active Voucher
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Enter the client's 6-character voucher string layout token code below.
                    </DialogDescription>
                </DialogHeader>

                {/* ==========================================
            SUBMISSION INPUT FORM
            ========================================== */}
                <form onSubmit={handleFetchVoucher} className="space-y-4 pt-2">
                    <div className="flex gap-2">
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value.slice(0, 6))}
                            placeholder="e.g., 52WNIQ"
                            maxLength={6}
                            disabled={isLoading}
                            className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder-zinc-600 tracking-widest font-mono text-center text-lg uppercase focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || code.length !== 6}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 cursor-pointer"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Error Indicator Box */}
                    {error && (
                        <div className="flex items-center gap-2 text-sm bg-red-950/40 border border-red-900/50 p-3 rounded-lg text-red-400">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </form>

                {/* ==========================================
            VOUCHER METRICS DISPLAY CONTAINER
            ========================================== */}
                {voucher && (
                    <div className="mt-4 border border-zinc-900 bg-zinc-900/20 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">

                        {/* Header Voucher Title State Banner */}
                        <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/40 gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                {/* 💡 REWARD IMAGE CONDITIONAL SECTION */}
                                {voucher.reward.imageUrl ? (
                                    <img
                                        src={voucher.reward.imageUrl}
                                        alt={voucher.reward.rewardName}
                                        className="h-12 w-12 rounded-lg object-cover border border-zinc-800 shrink-0 bg-zinc-900"
                                        onError={(e) => {
                                            // Safe fallback if image string URL exists but fails to download/load
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center shrink-0">
                                        <Ticket className="h-5 w-5 text-zinc-600" />
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Reward</p>
                                    <h4 className="text-md font-bold text-white mt-0.5 truncate">{voucher.reward.rewardName}</h4>
                                    <p className="text-xs text-blue-400 font-medium mt-0.5">Cost {voucher.reward.pointsCost} Points</p>
                                </div>
                            </div>

                            <span className={`text-xs px-2.5 py-1 rounded-full border font-mono font-bold tracking-wider shrink-0 ${getStatusStyle(voucher.status)}`}>
                                {voucher.status}
                            </span>
                        </div>

                        {/* Content Specifications Body */}
                        <div className="p-4 space-y-4">

                            {/* Linked Customer Profile Frame */}
                            <div className="flex items-center gap-3 bg-zinc-900/40 p-3 rounded-lg border border-zinc-900">
                                <Avatar className="h-10 w-10 border border-zinc-800">
                                    <AvatarImage src={voucher.user.linePictureUrl} alt={voucher.user.lineDisplayName} />
                                    <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs font-bold">LINE</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-zinc-500 font-medium">Claimed By (Customer)</p>
                                    <p className="text-sm font-semibold text-zinc-100 truncate mt-0.5">{voucher.user.lineDisplayName}</p>
                                </div>
                            </div>

                            {/* Time Metrics Footprint Rows */}
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1 bg-zinc-900/20 p-2.5 rounded-lg border border-zinc-900/60">
                                    <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
                                        <Calendar className="h-3.5 w-3.5 text-zinc-500" /> Issued
                                    </div>
                                    <p className="text-zinc-300 font-medium">{new Date(voucher.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="space-y-1 bg-zinc-900/20 p-2.5 rounded-lg border border-zinc-900/60">
                                    <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
                                        <Calendar className="h-3.5 w-3.5 text-zinc-500" /> Expiry Limit
                                    </div>
                                    <p className="text-zinc-300 font-medium">{new Date(voucher.expiresAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                        </div>

                        {/* Action Trigger Pad Footing */}
                        {voucher.status === 'PENDING' && (
                            <div className="w-full p-3 bg-zinc-900/50 border-t border-zinc-900 flex gap-4">
                                <Button variant="destructive" className="flex-1 bg-red-950 hover:bg-red-900/60 text-red-200 border border-red-900/50 font-medium text-xs h-9 gap-1.5 cursor-pointer">
                                    <Ban className="h-3.5 w-3.5" /> Cancel Code
                                </Button>
                                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 gap-1.5 cursor-pointer">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Redeem Voucher
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}