import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROLE_NAVIGATION } from "../../utils/constants";

function Sidebar() {
  const { userProfile } = useAuth();
  const links = ROLE_NAVIGATION[userProfile?.role] ?? [];

  return (
    <aside className="sidebar">
      <div className="brand-card">
        <p className="muted-light">Smart School</p>
        <h1>Student Management System</h1>
        <p className="muted-light">
          Responsive, scalable school operations across admin, teacher, and student portals.
        </p>
      </div>

      <div>
        <div className="nav-group-title">{userProfile?.role} navigation</div>
        <nav className="nav-list">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} className="nav-link" to={item.to} end>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <strong>{userProfile?.displayName ?? "User"}</strong>
        <p className="muted-light">{userProfile?.email}</p>
      </div>
    </aside>
  );
}

export default Sidebar;
