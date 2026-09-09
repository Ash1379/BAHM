import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
