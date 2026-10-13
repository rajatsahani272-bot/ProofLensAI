
import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import "./AppLayout.css";

const AppLayout = ({
  children,
  activePage = "dashboard",
  onNavigate
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-shell ${collapsed ? "app-shell-collapsed" : ""}`}>
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      <div className="app-main">
        <Header activePage={activePage} />

        <main className="app-content">
          {children}
        </main>

        <footer className="app-footer">
          <span>ProofLens AI</span>
          <span>AI-assisted verification · Results require human judgment</span>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
