import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthService } from '../api/authService';
import type { LoginFormValues } from '../models/authTypes';
import { consoleLogOnDev } from '@/config/constant';
import { useAuth } from '@/config/authProvider';
import { useNavigate } from 'react-router-dom';

export function useLoginViewModel() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { setCurrentAdmin, setAccessToken } = useAuth();
    const navigate = useNavigate();

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

            const res: any = await AuthService.handleLogin(values);

            const accessToken = res.data.access_token;
            const admin = res.data.admin;
            consoleLogOnDev(`AccessToken : ${accessToken}`);
            consoleLogOnDev(`Admin : ${JSON.stringify(admin)}`);

            setCurrentAdmin(admin);
            setAccessToken(accessToken);
            navigate('/home');
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