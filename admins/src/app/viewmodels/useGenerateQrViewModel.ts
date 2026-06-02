import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { GenerateQrCodeData } from '../models/qrTypes';
import { ApiActionService } from '../api/apiActionService';
import AuthAction from '@/config/authAction';

export function useGenerateQrViewModel(onSuccess?: () => void) {
    const [isLoading, setIsLoading] = useState(false);
    const [qrResult, setQrResult] = useState<GenerateQrCodeData | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { action } = AuthAction();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<{ points: string }>({
        defaultValues: { points: '' }
    });

    async function handleGenerate(values: { points: string }) {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const resData: any = await action(async () => ApiActionService.generatePointsToken(values.points));

            const earnPointsUrl = `${import.meta.env.VITE_CUSTOMER_SIDE_URL}?code_string=${resData.data.codeString}`;

            const qrCodeData: GenerateQrCodeData = {
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${earnPointsUrl}`,
                expiresInMinutes: resData.data.expiresMinutes,
            };

            setQrResult(qrCodeData);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.log(err);

            setErrorMessage(err.msg);
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