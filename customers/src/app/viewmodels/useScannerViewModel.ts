import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { consoleLogOnDev, consoleWarnOnDev } from '@/config/constant';

interface UseScannerViewModelProps {
    onScanSuccess: (decodedText: string) => void;
}

export function useScannerViewModel({ onScanSuccess }: UseScannerViewModelProps) {
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Initialize the scanner object targeting a DOM container ID element
        const scanner = new Html5QrcodeScanner(
            "qr-reader-element",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                rememberLastUsedCamera: true,
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
            },
      /* verbose= */ false
        );

        scannerRef.current = scanner;

        // 2. Start the rendering process
        scanner.render(
            (decodedText) => {
                // Stop scanning after a successful read to avoid duplicate rapid triggers
                scanner.clear()
                    .then(() => onScanSuccess(decodedText))
                    .catch((err) => console.error("Failed to clear scanner state:", err));
            },
            (error) => {
                // Verbose camera stream noise is ignored; capture real issues if needed
                if (typeof error === 'string' && error.includes('Permission')) {
                    setScannerError("Camera permission denied.");
                }
            }
        );

        setIsInitializing(false);

        // 3. CLEANUP: Vital for mobile to turn off physical camera hardware lens on unmount
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch((err) => console.error("Cleanup error:", err));
            }
        };
    }, [onScanSuccess]);

    const stopCameraAndBackward = useCallback(async () => {
        navigate(-1);
    }, [navigate]);

    return {
        scannerError,
        isInitializing,
        stopCameraAndBackward
    };
}