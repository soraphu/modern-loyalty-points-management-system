export interface ErrorFilteredReturn {
    status: number;
    error_code: string;
    msg: string;
}

const isDevMode = import.meta.env.VITE_ISDEV_MODE === 'true';

export const consoleLogOnDev = (data: any) => {
    if (isDevMode) console.log(data);
}

export const consoleWarnOnDev = (data: any, meta?: any) => {
    if (isDevMode) console.warn(data, meta);
}

export const waitFor = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

export const filterErrorMessage = (err: any): ErrorFilteredReturn => {

    if (err?.response?.data.message) {
        consoleWarnOnDev("RESPONSE: ");
        consoleWarnOnDev(err);
        return {
            status: err.response.status,
            error_code: err.response.data.errorCode,
            msg: err.response.data.message
        };
    }

    if (err?.response?.data.msg) {

        consoleWarnOnDev("RESPONSE: ");
        consoleWarnOnDev(err.response);
        return {
            status: err.response.status,
            error_code: err.response.data.error_code,
            msg: err.response.data.msg
        };
    }

    consoleWarnOnDev("SERVER NOT RESPONSE: ");
    consoleWarnOnDev(err);
    return {
        status: err.response.status,
        error_code: "SERVER_NOT_RESPONSE",
        msg: "Server not response, please try again later."
    };
}