
import { Bell, ChevronRight, Search, Sparkles } from "lucide-react";
import "./Header.css";

const pageTitles = {
  dashboard: "Dashboard",
  analyze: "Analyze Image",
  history: "Verification History",
  help: "Help & Support",
  settings: "Settings"
};

const Header = ({ activePage = "dashboard" }) => {
  const title = pageTitles[activePage] || "ProofLens AI";

  return (
    <header className="app-header">
      <div className="header-breadcrumb">
        <span className="header-root">Workspace</span>
        <ChevronRight size={15} />
        <h1>{title}</h1>
      </div>

      <div className="header-actions">
        <div className="header-ai-status">
          <span className="status-dot" />
          <span>AI Engine Ready</span>
        </div>

        <button
          type="button"
          className="header-icon-button"
          aria-label="Search"
          title="Search"
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          className="header-icon-button notification-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="header-divider" />

        <div className="header-profile">
          <div className="header-avatar">
            <Sparkles size={19} />
          </div>
          <div className="header-profile-copy">
            <span className="header-profile-name">ProofLens AI</span>
            <span className="header-profile-role">Verification Workspace</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
