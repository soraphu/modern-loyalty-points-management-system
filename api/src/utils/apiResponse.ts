// Define the configuration options interface using two Generic types
interface SuccessOptions<T> {
    data?: T | string;     // The pure data payload from model or database
    msg?: string;
    statusCode?: number;
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
    static fail({ msg, statusCode = 400 }: { msg: string; statusCode?: number }) {
        return {
            statusCode,
            payload: {
                success: false,
                msg,
            }
        };
    }

    /**
   * Semantic Error: 405 Method Not Allowed
   * Triggered when an incorrect HTTP verb hits an endpoint (e.g., GET instead of POST)
   */
    static invalidMethod(msg = 'HTTP method not allowed for this endpoint') {
        return this.fail({ msg, statusCode: 405 });
    }

    /**
     * Semantic Error: 400 Bad Request (Missing Fields)
     * Triggered when payload or query parameters fail basic presence checks
     */
    static requiredFieldsMissing(msg = 'Required payload or query parameters are missing') {
        return this.fail({ msg, statusCode: 400 });
    }

    /**
     * Semantic Error: 401 Unauthorized (Missing Token)
     * Triggered when the Authorization header is completely absent
     */
    static authTokenMissing(msg = 'Authentication token is required to access this resource') {
        return this.fail({ msg, statusCode: 401 });
    }

    /**
     * Semantic Error: 401 Unauthorized (Invalid Token)
     * Triggered when a token is provided but fails cryptographic verification or is expired
     */
    static authTokenInvalid(msg = 'Provided authentication token is invalid or expired') {
        return this.fail({ msg, statusCode: 401 });
    }

    /**
     * Semantic Error: 403 Forbidden
     * Triggered when a user is authenticated but lacks the specific permissions or roles required
     */
    static permissionDenied(msg = 'Access denied: Insufficient account permissions') {
        return this.fail({ msg, statusCode: 403 });
    }

    /**
     * Semantic Error: 404 Not Found
     * Triggered when a database record or specific asset does not exist
     */
    static resourceNotFound(msg = 'The requested resource could not be found') {
        return this.fail({ msg, statusCode: 404 });
    }

    /**
     * Semantic Error: 409 Conflict
     * Triggered when an operation violates a unique constraint (e.g., duplicate email registration)
     */
    static resourceConflict(msg = 'Resource already exists with the provided unique identifiers') {
        return this.fail({ msg, statusCode: 409 });
    }

}