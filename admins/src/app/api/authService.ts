import { apiClient } from '@/config/apiClient';
import type { RegisterFormValues, RegisterResponse } from '../models/authTypes';
import type { LoginFormValues, LoginResponse } from '../models/authTypes';
import { API_PATH, filterErrorMessage } from '@/config/constant';
import { toast } from 'sonner';

export const AuthService = {
    async register(payload: RegisterFormValues): Promise<RegisterResponse> {
        try {
            const response = await apiClient.post<RegisterResponse>(API_PATH.register, payload);

            return response.data;
        } catch (err: any) {
            const finalErrorMsg = filterErrorMessage(err);

            throw finalErrorMsg;
        }
    },

    async checkOwnerExist() {
        try {
            const res = await apiClient.get(API_PATH.checkOwnerExist);

            const toastId = toast.loading("Checking is owner exist.");

            toast.success(res.data.msg, { id: toastId });
        } catch (err) {
            const finalErrorMsg = filterErrorMessage(err);

            if (finalErrorMsg.error_code === 'SERVER_ERROR') {
                return toast.error(finalErrorMsg.msg);
            }

            throw new Error(finalErrorMsg.msg);
        }
    },

    async login(payload: LoginFormValues) {
        try {
            const response = await apiClient.post<LoginResponse>(API_PATH.login, payload);

            return response.data;
        } catch (err: any) {
            const finalErrorMsg = filterErrorMessage(err);

            throw finalErrorMsg;
        }
    }
};
