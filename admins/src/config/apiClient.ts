import type { AxiosInstance } from 'axios';
import axios from 'axios';

export const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
    timeout: 60000,

    withCredentials: true,

    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});