import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "User";
  const role = localStorage.getItem("role") || "User";

  const isAdmin = role === "Admin";

  const displayRole =
    role === "Admin" ? "Administrator" : "User";

  const avatarLetter = userName
    .charAt(0)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");

    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="brand-icon">
          Q
        </div>

        <div className="brand-text">
          <h2>QuickStop</h2>
          <span>Mart</span>
        </div>

      </div>

      <nav className="sidebar-nav">

        <p className="nav-label">
          MAIN MENU
        </p>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">
            ⌂
          </span>

          <span>
            Dashboard
          </span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">
            ▦
          </span>

          <span>
            Products
          </span>
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">
            🛒
          </span>

          <span>
            Cart
          </span>
        </NavLink>

        <NavLink
          to="/sales"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">
            ▤
          </span>

          <span>
            Sales
          </span>
        </NavLink>

        {isAdmin && (
          <>
            <p className="nav-label admin-label">
              ADMINISTRATION
            </p>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">
                ＋
              </span>

              <span>
                Manage Products
              </span>
            </NavLink>
          </>
        )}

        <NavLink
          to="/receipts"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">
            ◉
          </span>

          <span>
            Receipts
          </span>
        </NavLink>

      </nav>

      <div className="sidebar-bottom">


        <div className="sidebar-user">

          <div className="user-avatar">
            {avatarLetter}
          </div>

          <div className="user-info">

            <strong>
              {userName}
            </strong>

            <span>
              {displayRole}
            </span>

          </div>

          <button
            className="logout-button"
            type="button"
            onClick={handleLogout}
            title="Logout"
          >
            Logout
          </button>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;