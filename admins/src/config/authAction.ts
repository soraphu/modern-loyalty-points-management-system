import { apiClient } from './apiClient';
import { useAuth } from './authProvider';
import { API_PATH, consoleLogOnDev, filterErrorMessage } from './constant';

// Type definition for any API request function passed as a parameter
type AuthenticatedAction<T> = () => Promise<T>;

export default function AuthAction() {
    const { setCurrentAdmin, setAccessToken, getAccessToken, handleLogout } = useAuth();

    async function fetchAdminProfile() {
        consoleLogOnDev("Fetching admin profile with proactive token management...");
        return action(async () => {
            const res = await action(() => apiClient.get(API_PATH.profile));
            setCurrentAdmin(res.data.data.admin);
        });
    }

    function setupAuthHeader(token: string | null) {
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete apiClient.defaults.headers.common['Authorization'];
        }
    }

    async function action<T>(action: AuthenticatedAction<T>): Promise<T> {
        const accessToken = getAccessToken();

        // STEP 1: CHECK IF ACCESS TOKEN IS EMPTY
        if (!accessToken) {
            consoleLogOnDev("Access token missing. Initializing proactive refresh handshake...");
            const refreshSuccessful = await attemptTokenRefresh();

            if (!refreshSuccessful) {
                consoleLogOnDev("Logout!!! no refresh token or expired.");
                throw new Error('NO ACCESS TOKEN');
                // handleLogout();
            }
        }

        try {
            consoleLogOnDev("Try auth action...");
            setupAuthHeader(accessToken);
            // STEP 2: EXECUTE THE PRIMARY ACTION
            return await action();
        } catch (error: any) {

            // STEP 3: FALLBACK INTERCEPTOR FOR EXPIRED TOKENS MID-TRANSACTION
            // Catch a 401 Unauthorized payload if the token expired right during transit
            if (error.response?.status === 401) {
                consoleLogOnDev("Access token rejected by server. Initiating emergency refresh...");

                const refreshSuccessful = await attemptTokenRefresh();
                if (refreshSuccessful) {
                    // Retry the exact original action parameter once more with the fresh token
                    setupAuthHeader(accessToken);
                    return await action();
                } else {
                    consoleLogOnDev("Logout no refresh token or refresh failed after action.");
                    handleLogout();
                }
            }

            // Pass through any standard business-logic exceptions (e.g., 400 Bad Request)
            throw new Error(filterErrorMessage(error).error_code);
        }
    }//end

    async function attemptTokenRefresh(): Promise<boolean> {
        try {
            // Call your backend's refresh route layout
            const res = await apiClient.get(API_PATH.refreshToken);

            const accesstoken = res.data.data.access_token;
            setAccessToken(accesstoken);
            consoleLogOnDev("Token rotation executed successfully.");
            return true;
        } catch (error: any) {
            const filteredError = filterErrorMessage(error);
            consoleLogOnDev("Token refresh attempt failed.");
            consoleLogOnDev(filteredError);
            return false;
        }
    }

    return { action, fetchAdminProfile };
}