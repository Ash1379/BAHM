import apiRequest from "./client";

import {
    saveTokens,
    getAccessToken,
    getRefreshToken,
    clearTokens,
} from "../auth/storage";


export async function login(
    email,
    password
) {

    const data = await apiRequest(
        "/auth/login/",
        {
            method: "POST",
            body: {
                email,
                password,
            },
        }
    );


    saveTokens(
        data.tokens.access,
        data.tokens.refresh
    );


    return data;
}


export async function register(
    email,
    firstName,
    lastName,
    password,
    passwordConfirm
) {

    return apiRequest(
        "/auth/register/",
        {
            method: "POST",
            body: {
                email,
                first_name: firstName,
                last_name: lastName,
                password,
                password_confirm: passwordConfirm,
            },
        }
    );
}


export async function getMe() {

    const accessToken =
        getAccessToken();


    return apiRequest(
        "/auth/me/",
        {
            method: "GET",
            token: accessToken,
        }
    );
}


export async function logout() {

    const refreshToken =
        getRefreshToken();

    const accessToken =
        getAccessToken();


    try {

        return await apiRequest(
            "/auth/logout/",
            {
                method: "POST",
                token: accessToken,
                body: {
                    refresh: refreshToken,
                },
            }
        );

    } finally {

        clearTokens();
    }
}
