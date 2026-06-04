import { useGenerateQrViewModel } from '../viewmodels/useGenerateQrViewModel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QrCode, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { NavigateButtonUI } from '@/components/parts/navigate_button_ui';

export default function GenerateQrDialog() {
    const { register, errors, isLoading, qrResult, errorMessage, onSubmit, resetDialogState } = useGenerateQrViewModel();

    return (
        <Dialog onOpenChange={(open) => { if (!open) resetDialogState(); }}>

            {/* TRIGGER BUTTON (This sits out in your main HomePage List Button panel) */}
            <DialogTrigger asChild>
                <NavigateButtonUI Icon={QrCode} useColor='STAFF' title='Generate Code' />
            </DialogTrigger>

            {/* DIALOG MAIN PANEL WINDOW */}
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-50 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-wide flex items-center gap-2 text-white">
                        <QrCode className="h-5 w-5 text-blue-500" />
                        Generate Points QR
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 text-sm">
                        Issue a dynamic loyalty voucher matrix for an active customer profile.
                    </DialogDescription>
                </DialogHeader>

                {/* ERROR WARNING INTERCEPTOR */}
                {errorMessage && (
                    <Alert variant="destructive" className="border-red-900 bg-red-950/50 text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Operation Refused</AlertTitle>
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                {/* STEP 1: RENDER INPUT FORM FIELD LAYOUT */}
                {!qrResult ? (
                    <form onSubmit={onSubmit} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Point Allocation Value</label>
                            <Input
                                type="number"
                                placeholder="Ex: 500"
                                disabled={isLoading}
                                className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                {...register('points', {
                                    required: 'Please input point allocation amount.',
                                    min: { value: 1, message: 'Minimum allocation is 1 point.' }
                                })}
                            />
                            {errors.points && (
                                <p className="text-xs font-medium text-red-400 mt-0.5">{errors.points.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 text-white hover:bg-blue-500 font-semibold transition-all mt-2 cursor-pointer"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white " />
                                    Generating secure node...
                                </>
                            ) : (
                                "Create Reward QR"
                            )}
                        </Button>
                    </form>
                ) : (

                    /* STEP 2: GENERATION SUCCESSFUL -> DISPLAY THE LIVING QR CODE FRAME */
                    <div className="flex flex-col items-center justify-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-200">

                        {/* Success Alert Pill */}
                        <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-900 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Voucher Live
                        </div>

                        {/* The Invisible Frame Wrapper Containing the QR Code Image */}
                        <div className="p-4 bg-white rounded-xl shadow-2xl transition-transform hover:scale-[1.02] duration-300">
                            <img
                                src={qrResult.qrCodeUrl}
                                alt="Deepoints System Generated QR Code"
                                className="w-48 h-48 select-none tracking-normal"
                            />
                        </div>

                        {/* Expired Ticker Countdown Text */}
                        <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-zinc-200">Ready for Scan</p>
                            <p className="text-sm font-medium text-zinc-200">Customer will receive <span className='text-green-400'>{qrResult.value} points</span></p>
                            <p className="text-xs text-zinc-500 flex items-center justify-center gap-1.5">
                                <RefreshCw className="h-3 w-3 animate-spin duration-10000" />
                                Token automatically expires in <span className="text-zinc-400 font-bold">{qrResult.expiresInMinutes}m</span>
                            </p>
                        </div>

                        {/* Form Resetter Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetDialogState}
                            className="w-full border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                        >
                            Generate New Voucher
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
} // GenerateQrDialog