import UserMenu from "./UserMenu";

function Header({ onMenuClick }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          ☰
        </button>

        <div className="header-title">
          <h1>Dashboard</h1>
        </div>
      </div>

      <UserMenu />
    </header>
  );
}

export default Header;
