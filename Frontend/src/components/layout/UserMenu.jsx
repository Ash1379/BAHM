import { useAuth } from "../../auth/AuthContext";

function UserMenu() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="user-menu">
      <div className="user-info">
        <span className="user-name">{user?.first_name}</span>

        <span className="user-email">{user?.email}</span>
      </div>

      <button type="button" className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default UserMenu;
