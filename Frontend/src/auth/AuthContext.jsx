import { createContext, useContext, useEffect, useState } from "react";

import { login as loginApi, logout as logoutApi, getMe } from "../api/auth";

import { getAccessToken, getRefreshToken, clearTokens } from "./storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /*
   * Current authenticated user.
   *
   * null means the user is not authenticated.
   */
  const [user, setUser] = useState(null);

  /*
   * Authentication initialization state.
   *
   * While loading is true, we don't yet know
   * whether the user is authenticated.
   */
  const [loading, setLoading] = useState(true);

  /*
   * User is authenticated when user object exists.
   */
  const isAuthenticated = user !== null;

  /*
   * Login
   *
   * auth.js handles the API request and
   * saves the JWT tokens.
   *
   * AuthContext only updates React state.
   */
  async function login(email, password) {
    const data = await loginApi(email, password);

    setUser(data.user);

    return data;
  }

  /*
   * Logout
   *
   * auth.js sends the logout request.
   *
   * Regardless of whether the server request
   * succeeds, local authentication state
   * must be cleared.
   */
  async function logout() {
    const accessToken = getAccessToken();

    const refreshToken = getRefreshToken();

    try {
      if (accessToken && refreshToken) {
        await logoutApi();
      }
    } catch (error) {
      /*
       * Logout should still complete locally
       * even if the server request fails.
       */
      console.error("Logout request failed:", error);
    } finally {
      clearTokens();

      setUser(null);
    }
  }

  /*
   * Initialize authentication when the
   * AuthProvider is mounted.
   *
   * We don't manually refresh the token here.
   *
   * getMe() → client.js
   *              ↓
   *             401
   *              ↓
   *          token.js
   *              ↓
   *           refresh
   *              ↓
   *          retry /me
   */
  useEffect(() => {
    let cancelled = false;

    async function initializeAuth() {
      const accessToken = getAccessToken();

      /*
       * No Access Token means there is
       * no existing authentication session.
       */
      if (!accessToken) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        /*
         * client.js automatically handles
         * expired Access Tokens.
         */
        const currentUser = await getMe();

        /*
         * Prevent an old effect from updating
         * state after React has cleaned it up.
         *
         * This is especially useful with
         * React StrictMode in development.
         */
        if (!cancelled) {
          setUser(currentUser);
        }
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        /*
         * If authentication cannot be restored,
         * remove local authentication data.
         */
        if (!cancelled) {
          clearTokens();

          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    /*
     * Cleanup function.
     *
     * React may run effects more than once
     * in development StrictMode.
     */
    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Values exposed to the rest of React.
   */
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/*
 * Custom hook for accessing authentication state.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
