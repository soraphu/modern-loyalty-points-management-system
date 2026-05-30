import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthService } from '../api/authService';
import type { LoginFormValues } from '../models/authTypes';
import { toast } from 'sonner';
import { consoleLogOnDev } from '@/config/constant';

export function useLoginViewModel() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Native React Hook Form configuration without Zod dependencies
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        defaultValues: {
            username: '',
            password: '',
        },
    });

    async function handleLogin(values: LoginFormValues) {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const res: any = await AuthService.login(values);

            if (res.success) {
                const accessToken = res.data.access_token;
                consoleLogOnDev(`AccessToken : ${accessToken}`);
                // window.location.href = '/home';
            }
        } catch (err: any) {
            setErrorMessage(err.msg);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        register,
        errors,
        isLoading,
        errorMessage,
        onSubmit: handleSubmit(handleLogin),
    };
}