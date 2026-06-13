import { useScannerViewModel } from '../viewmodels/useScannerViewModel';
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ChevronLeft, Camera } from "lucide-react";

interface QrScannerPageProps {
    onScanResult: (result: string) => void;
}

export default function QrScannerPage({ onScanResult }: QrScannerPageProps) {
    // Use the exact same ViewModel architecture we built earlier
    const { scannerError, isInitializing, stopCameraAndBackward } = useScannerViewModel({
        onScanSuccess: (result) => {
            onScanResult(result);
            // onBack(); // Send the user back to the dashboard upon a successful scan
        }
    });

    return (
        <div className="w-full min-h-screen bg-zinc-950 text-white flex flex-col overflow-hidden font-sans select-none mx-auto">

            {/* 🧭 TOP NAVIGATION HEADER BAR */}
            <header className="flex items-center justify-between p-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={stopCameraAndBackward}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <span className="font-bold text-sm tracking-tight">QR Scanner</span>
                <div className="w-10" /> {/* Visual layout spacer to perfectly center the title */}
            </header>

            {/* 📺 INTERACTIVE CAMERA CAMERA VIEWER ELEMENT CONTAINER */}
            <main className="flex-1 flex flex-col justify-between p-6 relative">

                {/* Contextual Instructions */}
                <div className="text-center space-y-1 my-4">
                    <h2 className="text-xl font-black tracking-tight flex items-center justify-center gap-2">
                        <Camera className="h-5 w-5 text-emerald-400" /> Scan Receipt QR
                    </h2>
                    <p className="text-zinc-400 text-xs px-4">
                        Position the square QR code clearly inside the viewfinder overlay window to scan.
                    </p>
                </div>

                {/* 💡 THE VIEWPORT FRAME TARGET */}
                <div className="relative w-full aspect-square max-w-[320px] mx-auto rounded-[2rem] bg-zinc-900 border-2 border-zinc-800 overflow-hidden shadow-2xl shadow-emerald-950/20">

                    {/* The html5-qrcode target library stream engine */}
                    <div id="qr-reader-element" className="w-full h-full [&_video]:object-cover" />

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
                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full opacity-40" />
                </div>

            </main>
        </div>
    );
}