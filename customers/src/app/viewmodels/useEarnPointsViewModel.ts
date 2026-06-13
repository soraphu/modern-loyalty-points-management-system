import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/config/apiClient';
import { consoleWarnOnDev, waitFor } from '@/config/constant';

export function useEarnPointsViewModel() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Reactive UI States
    const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [earnedPoints, setEarnedPoints] = useState<number>(0);

    // 💡 1. Grab the HTTP variable (?code_string=...) out of the URL address bar
    const codeString = searchParams.get('code_string');

    useEffect(() => {
        // 🛡️ Guard Clause: If someone hits this URL without a code variable, reject them
        if (!codeString) {
            setErrorMessage("No QR verification code found in the request URL.");
            setStatus('ERROR');
            return;
        }

        async function submitQrCodeToBackend() {
            try {
                setStatus('LOADING');

                //const response = await apiClient.post('', { code_string: codeString });
                await waitFor(3000);
                // Assuming your backend responds with the number of points added
                // setEarnedPoints(response.data?.pointsEarned || 0);
                setStatus('SUCCESS');
            } catch (error: any) {
                // Captures your filtered interceptor error string
                console.log(error);
                setErrorMessage(error || "This QR code is invalid or has already been used.");
                setStatus('ERROR');
            }
        }

        submitQrCodeToBackend();
    }, [codeString]);

    return {
        status,
        errorMessage,
        earnedPoints,
        codeString,
        handleGoHome: () => navigate('/', { replace: true }) // Clears history stack
    };
}