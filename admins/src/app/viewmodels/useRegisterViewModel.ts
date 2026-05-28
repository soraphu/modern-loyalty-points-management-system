import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthService } from '../api/authService';
import type { RegisterFormValues } from '../models/authType';

export function useRegisterViewModel(onSuccessCallback?: () => void) {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    async function handleRegister(values: RegisterFormValues) {
        try {
            setIsLoading(true);
            setErrorMessage(null);
            setSuccessMessage(null);

            const response = await AuthService.register(values);

            if (response.success) {
                setSuccessMessage("Account created successfully!");
                reset(); // Clear form values
                if (onSuccessCallback) {
                    onSuccessCallback();
                }
            }
        } catch (err: any) {
            // Catches the string thrown by the API service sheet
            setErrorMessage(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        register,
        errors,
        isLoading,
        errorMessage,
        successMessage,
        onSubmit: handleSubmit(handleRegister),
    };
}