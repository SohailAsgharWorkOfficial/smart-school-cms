import { Outlet } from "react-router-dom";
import HeaderBar from "../components/layout/HeaderBar";
import Sidebar from "../components/layout/Sidebar";

function DashboardShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-area">
        <HeaderBar />
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardShell;
