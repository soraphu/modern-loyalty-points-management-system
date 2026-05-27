// Define the configuration options interface using two Generic types
export interface SuccessOptions<T> {
    data?: T | string;     // The pure data payload from model or database
    msg?: string;
    statusCode?: number;
}

export interface ReponseFailedType {
    statusCode: number;
    payload: {
        success: boolean;
        msg: string;
        error_code: string;
    }
}

export class ApiResponse {
    /**
     * Success Response Wrapper with dynamic data key naming
     * @template Key The literal string type of the custom key
     * @template T The structural type of the data payload
     */
    static success<T = string>({
        data = 'None',
        msg = 'Operation successful',
        statusCode = 200
    }: SuccessOptions<T> = {}) {
        return {
            statusCode,
            payload: {
                success: true,
                msg,
                data,
            }
        };
    }

    /**
     * Failure Response Wrapper
     */
    static fail({ msg, statusCode = 400, error_code }: { msg: string; statusCode?: number, error_code: string }): ReponseFailedType {
        return {
            statusCode,
            payload: {
                success: false,
                msg,
                error_code,
            }
        };
    }

    /**
     * Semantic Error: 400 Bad Request (Missing Fields)
     * Triggered when payload or query parameters fail basic presence checks
     */
    static requiredFieldsMissing(msg = 'Required payload or query parameters are missing.'): ReponseFailedType {
        return this.fail({ msg, statusCode: 400, error_code: "FIEDS_MISSING" });
    }

    /**
     * Semantic Error: 401 Unauthorized (Missing Token)
     * Triggered when the Authorization header is completely absent
     */
    static authTokenMissing(msg = 'Access token missing.'): ReponseFailedType {
        return this.fail({ msg, statusCode: 401, error_code: "ACC_TOKEN_MISSING" });
    }

    /**
     * Semantic Error: 401 Unauthorized (Invalid Token)
     * Triggered when a token is provided but fails cryptographic verification or is expired
     */
    static authTokenInvalid(msg = 'Invalid or expires access token.'): ReponseFailedType {
        return this.fail({ msg, statusCode: 401, error_code: "INVALID_ACC_TOKEN" });
    }

    /**
     * Semantic Error: 403 Forbidden
     * Triggered when a user is authenticated but lacks the specific permissions or roles required
     */
    static permissionDenied(msg = 'Access denied: Insufficient account permissions'): ReponseFailedType {
        return this.fail({ msg, statusCode: 403, error_code: "FORBIDDEN" });
    }

    /**
     * Semantic Error: 404 Not Found
     * Triggered when a database record or specific asset does not exist
     */
    static resourceNotFound(msg = 'The requested resource could not be found'): ReponseFailedType {
        return this.fail({ msg, statusCode: 404, error_code: "ACC_TOKEN_MISSING" });
    }

    /**
     * Semantic Error: 409 Conflict
     * Triggered when an operation violates a unique constraint (e.g., duplicate email registration)
     */
    static resourceConflict(msg = 'Resource already exists with the provided unique identifiers'): ReponseFailedType {
        return this.fail({ msg, statusCode: 409, error_code: "DUPLICATE" });
    }

    static internalServerError(msg = 'Internal server error'): ReponseFailedType {
        return this.fail({ msg, statusCode: 500, error_code: "SERVER_ERROR" });
    }

}