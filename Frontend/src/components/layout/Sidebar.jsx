import { NavLink } from "react-router-dom";

import navigation from "./navigation";

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>BAHM</h2>

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav>
          {navigation.map((section) => (
            <div key={section.section}>
              <h3>{section.section}</h3>

              <ul>
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  );
}

export default Sidebar;
