/**
 * HTTP Status Codes
 *
 * CONCEPT: HTTP status codes are standardized responses from servers.
 * Using constants makes code more readable and prevents typos.
 *
 * Categories:
 * - 2xx: Success
 * - 4xx: Client errors (user did something wrong)
 * - 5xx: Server errors (something went wrong on our end)
 */
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
//# sourceMappingURL=http.d.ts.map