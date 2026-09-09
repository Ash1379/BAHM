import {
    getAccessToken,
} from "../auth/storage";

import {
    refreshAccessToken,
} from "../auth/token";


const API_BASE_URL =
    "http://127.0.0.1:8000/api";


/*
 * Authentication endpoints that must NOT
 * trigger automatic token refresh.
 */
const NO_REFRESH_ENDPOINTS = [
    "/auth/login/",
    "/auth/register/",
    "/auth/token/refresh/",
    "/auth/logout/",
];


/*
 * Check whether the current endpoint
 * is excluded from automatic refresh.
 */
function shouldRefresh(endpoint) {
    return !NO_REFRESH_ENDPOINTS.includes(endpoint);
}


/*
 * Send an API request.
 *
 * Flow:
 *
 * Request
 *    ↓
 * 401?
 *    ↓
 * Yes
 *    ↓
 * Refresh Access Token
 *    ↓
 * Retry original request once
 */
async function apiRequest(
    endpoint,
    options = {},
    retry = true
) {
    const {
        method = "GET",
        body,
        token,
        headers = {},
    } = options;


    /*
     * Use explicitly provided token first.
     *
     * If no token was provided,
     * read the current Access Token
     * from storage.
     */
    const accessToken =
        token ?? getAccessToken();


    /*
     * Build request headers.
     */
    const requestHeaders = {
        ...headers,
    };


    /*
     * JSON body requires
     * Content-Type header.
     */
    if (body !== undefined) {
        requestHeaders["Content-Type"] =
            "application/json";
    }


    /*
     * Add JWT Authorization header
     * when an Access Token exists.
     */
    if (accessToken) {
        requestHeaders["Authorization"] =
            `Bearer ${accessToken}`;
    }


    /*
     * Send request to Django API.
     */
    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            method,
            headers: requestHeaders,
            body:
                body !== undefined
                    ? JSON.stringify(body)
                    : undefined,
        }
    );


    /*
     * Try to read JSON response.
     *
     * Some responses may not contain JSON,
     * therefore parsing failure is ignored.
     */
    // eslint-disable-next-line no-useless-assignment
    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }


    /*
     * Access Token may have expired.
     *
     * Only attempt refresh when:
     *
     * 1. Response is 401
     * 2. This request has not already been retried
     * 3. Endpoint is allowed to refresh
     */
    if (
        response.status === 401 &&
        retry &&
        shouldRefresh(endpoint)
    ) {
        /*
         * Ask token.js to refresh the
         * Access Token.
         *
         * token.js also prevents multiple
         * simultaneous refresh requests.
         */
        const refreshData =
            await refreshAccessToken();


        /*
         * Retry the original request exactly once
         * using the new Access Token.
         */
        return apiRequest(
            endpoint,
            {
                ...options,
                token: refreshData.access,
            },
            false
        );
    }


    /*
     * Any remaining non-2xx response
     * is returned as an API error.
     */
    if (!response.ok) {
        throw {
            status: response.status,
            data,
        };
    }


    /*
     * Successful API response.
     */
    return data;
}


export default apiRequest;