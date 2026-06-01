import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
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

// apiClient.interceptors.response.use(
//     (response: AxiosResponse) => {
//         return response;
//     },
//     (error) => {
//         const { response } = error;

//         if (response) {
//             switch (response.status) {
//                 case 401:
//                     // UNAUTHORIZED: Session cookie is invalid or expired
//                     console.warn('Session expired or invalid cookie. Redirecting to login...');

//                     // NOTE: JavaScript cannot clean HttpOnly cookies! 
//                     // You must let the backend clear it during a logout request, or simply redirect:
//                     if (window.location.pathname !== '/') {
//                         window.location.href = '/';
//                     }
//                     break;

//                 case 403:
//                     console.error('Access Denied: Insufficient permissions.');
//                     break;

//                 case 500:
//                     console.error('Internal Server Error.');
//                     break;

//                 default:
//                     break;
//             }
//         } else if (error.request) {
//             console.error('Network Connection Error.');
//         }

//         return Promise.reject(error);
//     }
// );