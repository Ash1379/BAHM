import { useAuth } from "../auth/AuthContext";

function AuthTest() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  if (!isAuthenticated) {
    return <p>Not authenticated.</p>;
  }

  return (
    <div>
      <h2>Authentication Test</h2>

      <p>Email: {user.email}</p>

      <p>
        Name: {user.first_name} {user.last_name}
      </p>

      <p>Authenticated: Yes</p>
    </div>
  );
}

export default AuthTest;
