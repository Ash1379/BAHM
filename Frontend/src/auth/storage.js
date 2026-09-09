const ACCESS_TOKEN_KEY = "bahm_access_token";
const REFRESH_TOKEN_KEY = "bahm_refresh_token";


export function saveTokens(accessToken, refreshToken) {
    localStorage.setItem(
        ACCESS_TOKEN_KEY,
        accessToken
    );

    localStorage.setItem(
        REFRESH_TOKEN_KEY,
        refreshToken
    );
}


export function getAccessToken() {
    return localStorage.getItem(
        ACCESS_TOKEN_KEY
    );
}


export function getRefreshToken() {
    return localStorage.getItem(
        REFRESH_TOKEN_KEY
    );
}


export function clearTokens() {
    localStorage.removeItem(
        ACCESS_TOKEN_KEY
    );

    localStorage.removeItem(
        REFRESH_TOKEN_KEY
    );
}
