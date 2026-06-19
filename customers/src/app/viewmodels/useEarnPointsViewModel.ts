import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_PATH, apiClient } from '@/config/apiClient';
import { consoleLogOnDev } from '@/config/constant';

export function useEarnPointsViewModel() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Reactive UI States
    const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [earnedPoints, setEarnedPoints] = useState<number>(0);

    const codeString = searchParams.get('code_string');

    useEffect(() => {
        consoleLogOnDev(codeString);

        if (!codeString) {
            setErrorMessage("No QR verification code found in the request URL.");
            setStatus('ERROR');
            return;
        }

        async function submitQrCodeToBackend() {
            try {
                setStatus('LOADING');

                const response = await apiClient.post(API_PATH.earnPoints, { code_string: codeString });

                setEarnedPoints(response.data?.data?.transaction?.pointsAmount || 0);
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