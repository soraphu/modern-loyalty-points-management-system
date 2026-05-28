import { apiClient } from '@/config/apiClient';
import type { RegisterFormValues, RegisterResponse } from '../models/authType';

export const AuthService = {
    async register(payload: RegisterFormValues): Promise<RegisterResponse> {
        try {
            const response = await apiClient.post<RegisterResponse>('/auth/register', payload);
            return response.data;
        } catch (error: any) {
            console.error("API Error in AuthService.register:", error);

            // Extract the server's custom error message string layout, or fall back to standard text
            const backendMessage = error.response?.data?.message || "Registration failed. Please try again.";

            // Re-throw a clean message string so the ViewModel catches it cleanly
            throw new Error(backendMessage);
        }
    }
};