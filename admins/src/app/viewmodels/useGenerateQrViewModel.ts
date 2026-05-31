import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { GenerateQrRequest, GenerateQrResponse } from '../models/qrTypes';

export function useGenerateQrViewModel(onSuccess?: () => void) {
    const [isLoading, setIsLoading] = useState(false);
    const [qrResult, setQrResult] = useState<GenerateQrResponse | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<{ points: string }>({
        defaultValues: { points: '' }
    });

    async function handleGenerate(values: { points: string }) {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const numPoints = parseInt(values.points, 10);
            if (isNaN(numPoints) || numPoints <= 0) {
                throw new Error("Points must be a positive number.");
            }

            // Simulated network call to your Fastify/Express backend engine
            await new Promise((resolve) => setTimeout(resolve, 1200));

            // Mocking a successful response containing a temporary QR code payload matrix
            const mockResponse: GenerateQrResponse = {
                success: true,
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=deepoints_tx_${Date.now()}_amt_${numPoints}`,
                token: `tok_${Math.random().toString(36).substring(7)}`,
                expiresInSeconds: 60,
            };

            setQrResult(mockResponse);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setErrorMessage(err.message || "Failed to finalize system QR generation.");
        } finally {
            setIsLoading(false);
        }
    }

    const resetDialogState = () => {
        setQrResult(null);
        setErrorMessage(null);
        reset();
    };

    return {
        register,
        errors,
        isLoading,
        qrResult,
        errorMessage,
        onSubmit: handleSubmit(handleGenerate),
        resetDialogState,
    };
}