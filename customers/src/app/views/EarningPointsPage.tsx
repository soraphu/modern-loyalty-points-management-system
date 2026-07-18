import { useEarningPointsViewModel } from '../viewmodels/useEarnPointsViewModel';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Gift } from "lucide-react";

export default function EarningPointsPage() {
    const { status, errorMessage, earnedPoints, codeString, handleGoHome } = useEarningPointsViewModel();

    return (
        <div className="w-full md:max-w-md min-h-screen bg-[#8cd4b4] flex flex-col justify-center items-center p-6 mx-auto font-sans select-none">

            {/* Main Container Envelope */}
            <Card className="w-full border-0 rounded-[2.5rem] p-8 text-center shadow-2xl bg-white">
                <CardContent className="p-0 flex flex-col items-center space-y-6">

                    {/* ⏳ PHASE A: API PROCESSING STREAM LOADING STATE */}
                    {status === 'LOADING' && (
                        <>
                            <div className="p-4 bg-zinc-100 rounded-full animate-bounce">
                                <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black tracking-tight text-zinc-900">Validating Code</h3>
                                <p className="text-zinc-500 text-sm">Communicating secure verification handshake with ledger networks...</p>
                                {codeString && (
                                    <p className="text-[10px] font-mono text-zinc-400 bg-zinc-50 p-1.5 rounded-md mt-2 truncate max-w-[240px] mx-auto">
                                        ID: {codeString}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* ✅ PHASE B: SECURE TRANSACTION CLEARED SUCCESS STATE */}
                    {status === 'SUCCESS' && (
                        <>
                            <div className="p-5 bg-emerald-100 rounded-full ring-8 ring-emerald-50 scale-105 transition-all">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                            </div>
                            <div className="space-y-2 w-full">
                                <h3 className="text-2xl font-black tracking-tight text-emerald-950">Points Claimed!</h3>
                                <p className="text-zinc-600 text-sm px-2">Your receipt transaction signature processed successfully.</p>

                                {/* Visual Points Voucher Counter Display Badge */}
                                <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl py-4 my-4 max-w-xs mx-auto">
                                    <div className="text-xs text-emerald-700 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                                        <Gift className="h-3.5 w-3.5" /> Reward Balance Added
                                    </div>
                                    <div className="text-4xl font-black text-emerald-500 mt-1">+{earnedPoints} PTS</div>
                                </div>
                            </div>
                            <Button
                                onClick={handleGoHome}
                                className="w-full bg-[#14cc04] hover:bg-[#10a404] text-white rounded-2xl py-6 font-bold text-base shadow-lg shadow-emerald-600/20"
                            >
                                Back to Dashboard
                            </Button>
                        </>
                    )}

                    {/* ❌ PHASE C: REDEMPTION VOID EXCEPTION ERROR STATE */}
                    {status === 'ERROR' && (
                        <>
                            <div className="p-5 bg-rose-100 rounded-full ring-8 ring-rose-50">
                                <XCircle className="h-12 w-12 text-rose-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black tracking-tight text-rose-950">Unable to Claim</h3>
                                <p className="text-rose-600/90 text-sm bg-rose-50/50 border border-rose-100 p-4 rounded-2xl max-w-xs font-medium leading-relaxed">
                                    {errorMessage}
                                </p>
                            </div>
                            <Button
                                onClick={handleGoHome}
                                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl py-6 font-bold text-base"
                            >
                                Return Home
                            </Button>
                        </>
                    )}

                </CardContent>
            </Card>

        </div>
    );
}