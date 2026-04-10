import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

function HeaderBar() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar-card">
        <div>
          <p className="muted-text">Role-based workspace</p>
          <h3 style={{ margin: 0 }}>{userProfile?.displayName}</h3>
        </div>
        <span className="badge info">{userProfile?.role}</span>
      </div>

      <div className="topbar-card">
        <div>
          <p className="muted-text">Secure Firebase access</p>
          <strong>{userProfile?.email}</strong>
        </div>
        <button className="button secondary" type="button" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}

export default HeaderBar;
