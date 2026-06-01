const isDevMode = import.meta.env.VITE_ISDEV_MODE === 'true';

export const consoleLogOnDev = (data: any) => {
    if (isDevMode) console.log(data);
}

export const consoleWarnOnDev = (data: any) => {
    if (isDevMode) console.warn(data);
}

export const waitFor = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

export const filterErrorMessage = (err: any) => {
    if (err.response) {

        consoleWarnOnDev("RESPONSE: ");
        consoleWarnOnDev(err.response);
        return {
            error_code: err.response.data.error_code,
            msg: err.response.data.msg
        };
    }

    consoleWarnOnDev("NOT RESPONSE: ");
    consoleWarnOnDev(err);
    return {
        error_code: "SERVER_NOT_RESPONSE",
        msg: "Server not response, please try again later."
    };
}

export const API_PATH = {
    checkHealth: '/',
    register: '/register-owner',
    login: '/login',
    checkOwnerExist: '/is-owner-exist',
    refreshToken: '/auth/refresh',
    profile: '/profile',
    logout: '/logout'
}