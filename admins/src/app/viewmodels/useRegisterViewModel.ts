import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthService } from '../api/authService';
import type { RegisterFormValues } from '../models/authTypes';
import { toast } from 'sonner';
import { consoleLogOnDev } from '@/config/constant';

export function useRegisterViewModel() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        initCheckOwnerExist();
    }, []);

    // Initialize standard React Hook Form without external schema engines
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        defaultValues: {
            username: '',
            firstname: '',
            lastname: '',
            password: '',
        },
    });

    async function initCheckOwnerExist() {
        try {
            await AuthService.checkOwnerExist();
        } catch (error) {
            window.location.href = '/login';
        }
    }// init check owner exist.

    async function handleRegister(values: RegisterFormValues) {
        try {
            setIsLoading(true);
            setErrorMessage(null);
            setSuccessMessage(null);

            const res: any = await AuthService.register(values);

            consoleLogOnDev(res);

            if (res.success) {
                setSuccessMessage("Account created successfully!");
                reset(); // Clear form values
                window.location.href = '/login';
            }
        } catch (err: any) {
            toast.error(err.msg);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        register,
        initCheckOwnerExist,
        errors,
        isLoading,
        errorMessage,
        successMessage,
        onSubmit: handleSubmit(handleRegister),
    };
}//end