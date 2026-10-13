
import {
  ShieldCheck,
  LayoutDashboard,
  ScanSearch,
  History,
  Settings,
  CircleHelp,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import "./Sidebar.css";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, path: "dashboard" },
  { label: "Analyze Image", icon: ScanSearch, path: "analyze" },
  { label: "History", icon: History, path: "history" }
];

const Sidebar = ({
  activePage = "dashboard",
  onNavigate,
  collapsed = false,
  onToggle
}) => {
  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <ShieldCheck size={24} />
        </div>

        {!collapsed && (
          <div className="brand-copy">
            <span className="brand-name">ProofLens</span>
            <span className="brand-caption">AI VERIFICATION</span>
          </div>
        )}
      </div>

      <div className="sidebar-section-label">
        {!collapsed && "WORKSPACE"}
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigation.map(({ label, icon: Icon, path }) => (
          <button
            key={path}
            type="button"
            className={`sidebar-link ${
              activePage === path ? "sidebar-link-active" : ""
            }`}
            onClick={() => onNavigate?.(path)}
            title={collapsed ? label : undefined}
            aria-current={activePage === path ? "page" : undefined}
          >
            <Icon size={19} />
            {!collapsed && <span>{label}</span>}
            {!collapsed && path === "analyze" && (
              <span className="sidebar-new-badge">AI</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-divider" />

        <button
          type="button"
          className="sidebar-link"
          onClick={() => onNavigate?.("help")}
          title={collapsed ? "Help & Support" : undefined}
        >
          <CircleHelp size={19} />
          {!collapsed && <span>Help & Support</span>}
        </button>

        <button
          type="button"
          className="sidebar-link"
          onClick={() => onNavigate?.("settings")}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={19} />
          {!collapsed && <span>Settings</span>}
        </button>

        <button
          type="button"
          className="sidebar-collapse"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
          {!collapsed && <span>Collapse sidebar</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
