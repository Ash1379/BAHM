import {
    getRefreshToken,
    saveTokens,
    clearTokens,
} from "./storage";

const API_BASE_URL = "http://127.0.0.1:8000/api";

let refreshPromise = null;

export async function refreshAccessToken() {
    /*
     * Get the current Refresh Token.
     */
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        throw new Error(
            "Refresh token is not available."
        );
    }

    /*
     * Prevent multiple API requests from
     * refreshing the token at the same time.
     */
    if (!refreshPromise) {
        refreshPromise = fetch(
            `${API_BASE_URL}/auth/token/refresh/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refresh: refreshToken,
                }),
            }
        )
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    throw {
                        status: response.status,
                        data,
                    };
                }

                /*
                 * Save the new Access Token.
                 *
                 * If Refresh Token Rotation is enabled
                 * and Django returns a new refresh token,
                 * save it as well.
                 */
                saveTokens(
                    data.access,
                    data.refresh ?? refreshToken
                );

                return data;
            })
            .catch((error) => {
                clearTokens();
                throw error;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

