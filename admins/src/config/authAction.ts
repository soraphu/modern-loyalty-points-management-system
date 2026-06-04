import { useNavigate } from 'react-router-dom';
import { apiClient } from './apiClient';
import { setupAuthHeader, useAuth } from './authProvider';
import { API_PATH, consoleLogOnDev, filterErrorMessage } from './constant';

// Type definition for any API request function passed as a parameter
type AuthenticatedAction<T> = () => Promise<T>;

export default function AuthAction() {
    const { setCurrentAdmin, setAccessToken, getAccessToken, handleLogout } = useAuth();
    const navigate = useNavigate();

    async function fetchAdminProfile() {
        consoleLogOnDev("Fetching admin profile with proactive token management...");
        return action(async () => {
            const res = await action(() => apiClient.get(API_PATH.profile));
            setCurrentAdmin(res.data.data.admin);
        });
    }

    async function action<T>(action: AuthenticatedAction<T>): Promise<T> {
        let tempAccessToken = getAccessToken();

        // STEP 1: CHECK IF ACCESS TOKEN IS EMPTY
        if (!tempAccessToken) {
            consoleLogOnDev("Access token missing. Initializing proactive refresh handshake...");
            tempAccessToken = await attemptTokenRefresh();

            if (!tempAccessToken) {
                consoleLogOnDev("Logout!!! no refresh token or expired.");
                handleLogout();
            }
            consoleLogOnDev("Refresh token success.");
        }

        try {
            consoleLogOnDev("Try auth action...");
            setupAuthHeader(tempAccessToken);

            const res = await action();

            consoleLogOnDev("Auth action successfully.");
            return res;
        } catch (error: any) {

            consoleLogOnDev("Auth action failed.");
            if (error.response?.status === 401) {
                consoleLogOnDev("Access token rejected by server. Initiating emergency refresh...");

                tempAccessToken = await attemptTokenRefresh();
                if (tempAccessToken) {
                    setupAuthHeader(tempAccessToken);
                    const res = await action();

                    consoleLogOnDev("Auth action last try successfully.");
                    return res;
                } else {
                    consoleLogOnDev("Logout no refresh token or refresh failed after action.");
                    handleLogout();
                }
            }

            // Pass through any standard business-logic exceptions (e.g., 400 Bad Request)
            throw error;
        }
    }//end

    async function navigateHomeOnLoggedIn() {
        let tempAccessToken = getAccessToken();

        // STEP 1: CHECK IF ACCESS TOKEN IS EMPTY
        if (!tempAccessToken) {
            consoleLogOnDev("Access token missing. Initializing proactive refresh handshake...");
            tempAccessToken = await attemptTokenRefresh();

            if (!tempAccessToken) {
                consoleLogOnDev("No refresh token, do nothing.");
                return;
            }
        }

        consoleLogOnDev("Refresh token success.");
        navigate('/home');
    }//end

    async function attemptTokenRefresh() {
        try {
            // Call your backend's refresh route layout
            const res = await apiClient.get(API_PATH.refreshToken);

            const accesstoken = res.data.data.access_token;
            setAccessToken(accesstoken);
            consoleLogOnDev("Token rotation executed successfully, try auth action again.");
            consoleLogOnDev("AccessToken: " + accesstoken);
            return accesstoken;
        } catch (error: any) {
            const filteredError = filterErrorMessage(error);
            consoleLogOnDev("Token refresh attempt failed.");
            consoleLogOnDev(filteredError);
            return;
        }
    }

    return { action, fetchAdminProfile, navigateHomeOnLoggedIn };
}