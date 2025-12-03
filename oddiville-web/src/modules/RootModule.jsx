import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
// import { useDispatch } from "react-redux";

const RootModule = () => {
  const navigate = useNavigate();
  // const dispatch = useDispatch()
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("metadata")) {
      navigate("/signin");
      return;
    }
  }, [navigate]);

  // Close sidebar on route change (optional, for mobile UX)
  // useEffect(() => {
  //   setSidebarOpen(false);
  // }, [location.pathname]);

  return (
    <div className={`main-layout${sidebarOpen ? "" : ""}`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg">
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />
        <Outlet />
      </main>
      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop${sidebarOpen ? "" : " hide"}`}
        onClick={() => setSidebarOpen(false)}
      />
    </div>
  );
};

export default RootModule;
