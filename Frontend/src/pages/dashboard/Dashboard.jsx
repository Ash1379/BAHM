import { useAuth } from "../../auth/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Welcome, {user?.first_name}!</p>

      <p>Email: {user?.email}</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
