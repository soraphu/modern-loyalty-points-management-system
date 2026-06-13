import { useScannerViewModel } from '../viewmodels/useScannerViewModel';
import { Button } from "@/components/ui/button";
import { consoleLogOnDev } from '@/config/constant';
import { Loader2, AlertTriangle, CircleChevronLeft, Camera, QrCode } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function QrScannerPage() {
    const navigate = useNavigate();

    // Use the exact same ViewModel architecture we built earlier
    const { scannerError, isInitializing } = useScannerViewModel({
        onScanSuccess: (result) => {
            consoleLogOnDev(result);
            navigate("/earn-points?code_string=" + result);
        }
    });

    return (
        <div className="w-full min-h-screen bg-app-background text-white flex flex-col overflow-hidden font-sans select-none mx-auto">

            {/* 🧭 TOP NAVIGATION HEADER BAR */}
            <header className="flex items-center justify-center p-4 bg-app-foreground backdrop-blur sticky top-0 z-20">
                <span className="font-bold text-sm tracking-tight flex gap-2"><QrCode size={20} />QR Scanner</span>
                <div className="w-10" /> {/* Visual layout spacer to perfectly center the title */}
            </header>

            {/* 📺 INTERACTIVE CAMERA CAMERA VIEWER ELEMENT CONTAINER */}
            <main className="flex-1 flex flex-col justify-around p-6 relative">

                {/* Contextual Instructions */}
                <div className="text-center space-y-1 my-4">
                    <h2 className="text-xl font-black tracking-tight flex items-center justify-center gap-2 text-zinc-700">
                        <Camera className="h-5 w-5 text-emerald-500" /> Scan to Earn Points
                    </h2>
                    <p className="text-zinc-400 text-xs px-4">
                        Position the square QR code clearly inside the viewfinder overlay window to scan.
                    </p>
                </div>

                {/* 💡 THE VIEWPORT FRAME TARGET */}
                <div className="relative w-full aspect-square max-w-[320px] max-h-60 mx-auto rounded-[2rem] bg-zinc-600 border-2 overflow-hidden shadow-2xl shadow-emerald-950/20">

                    {/* The html5-qrcode target library stream engine */}
                    <div id="qr-reader-element" className="w-full h-full qr-scanner-wrapper [&_video]:object-cover" />

                    {/* ⏳ Loading Mask Overlay */}
                    {isInitializing && (
                        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center space-y-3 z-10">
                            <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
                            <p className="text-xs text-zinc-500 font-medium">Initializing camera module...</p>
                        </div>
                    )}

                    {/* ⚠️ Hardware Error Mask Overlay */}
                    {scannerError && (
                        <div className="absolute inset-0 bg-zinc-950 p-6 flex flex-col items-center justify-center text-center space-y-3 z-10">
                            <AlertTriangle className="h-8 w-8 text-amber-500" />
                            <p className="text-sm font-bold text-zinc-200">{scannerError}</p>
                            <p className="text-xs text-zinc-500">Please make sure browser permissions are granted for your camera.</p>
                        </div>
                    )}
                </div>

                {/* Footer Design Placeholder to Balance Layout Proportions */}
                <div className="w-full py-6 flex justify-center">
                    <Button
                        onClick={() => location.href = '/'}
                        className='cursor-pointer bg-zinc-800 gap-2 rounded-4xl w-40 h-10 md:w-60 shadow-md' >
                        <CircleChevronLeft />
                        RETURN
                    </Button>
                </div>

            </main>
        </div>
    );
}