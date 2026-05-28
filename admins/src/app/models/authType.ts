export interface RegisterFormValues {
    username: string;
    firstname: string;
    lastname: string;
    password: string;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        username: string;
        firstname: string;
        lastname: string;
    };
}