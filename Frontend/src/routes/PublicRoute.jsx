import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

function PublicRoute() {
  const { loading, isAuthenticated } = useAuth();

  /*
   * Authentication status is still
   * being initialized.
   *
   * Don't redirect until we know
   * whether the user is authenticated.
   */
  if (loading) {
    return <p>Checking authentication...</p>;
  }

  /*
   * User is already authenticated.
   *
   * Public authentication pages such as
   * Login should not be accessible.
   */
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  /*
   * User is not authenticated.
   *
   * Allow access to the public route.
   */
  return <Outlet />;
}

export default PublicRoute;
