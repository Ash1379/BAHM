import { useAuth } from "../../auth/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Welcome, {user?.first_name}!</p>

      <p>Email: {user?.email}</p>
    </div>
  );
}

export default Dashboard;
