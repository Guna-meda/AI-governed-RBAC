// src/components/Sidebar.jsx
import { ShieldIcon, ChatIcon, LogIcon, DashIcon, AlertIcon, LogoutIcon } from "./Icons";
import { getRoleBadgeClass } from "../utils/helpers";

const sidebarStyles = `
  .sidebar {
    width: var(--sidebar-w);
    background: var(--charcoal);
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0; top: 0; bottom: 0;
    z-index: 100;
  }
  .sidebar-logo {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; gap: 10px;
  }
  .sidebar-logo-icon {
    width: 32px; height: 32px;
    background: var(--gold);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sidebar-logo-text { font-family: 'DM Serif Display', serif; font-size: 17px; color: white; letter-spacing: 0.02em; }
  .sidebar-logo-sub  { font-size: 10px; color: rgba(255,255,255,0.4); letter-spacing: 0.08em; text-transform: uppercase; }

  .sidebar-user {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; gap: 12px;
  }
  .sidebar-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--gold);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600; color: var(--charcoal); flex-shrink: 0;
  }
  .sidebar-user-name { font-size: 13px; font-weight: 500; color: white; }
  .sidebar-user-role { font-size: 11px; color: rgba(255,255,255,0.45); }

  .sidebar-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
  .nav-section-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(255,255,255,0.25); padding: 12px 24px 4px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 20px; margin: 1px 8px;
    border-radius: 8px; cursor: pointer; transition: all 0.15s;
    font-size: 13.5px; color: rgba(255,255,255,0.55);
    border: none; background: none;
    width: calc(100% - 16px); text-align: left;
  }
  .nav-item:hover  { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
  .nav-item.active { background: rgba(201,153,62,0.15); color: var(--gold); }
  .nav-item svg { flex-shrink: 0; opacity: 0.7; }
  .nav-item.active svg { opacity: 1; }
  .nav-badge {
    margin-left: auto;
    background: var(--rose); color: white;
    font-size: 10px; font-weight: 600;
    padding: 2px 6px; border-radius: 10px;
  }
  .sidebar-logout {
    padding: 12px 16px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .logout-btn {
    display: flex; align-items: center; gap: 8px;
    width: 100%; padding: 8px 12px;
    border-radius: 8px; border: none; background: none;
    cursor: pointer; font-size: 13px;
    color: rgba(255,255,255,0.4); transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .logout-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); }
`;

export default function Sidebar({ user, page, onNavigate, onLogout, alertCount }) {
  // Improved admin check — supports both "executive" and "Admin"
  const isAdmin = ["executive", "Executive", "admin", "Admin"].includes(user.role);

  const navItems = [
    { id: "chat",      label: "AI Assistant", icon: <ChatIcon /> },
    ...(isAdmin ? [
      { id: "dashboard", label: "Dashboard",   icon: <DashIcon /> },
      { id: "audit",     label: "Audit Logs",  icon: <LogIcon /> },
      { id: "alerts",    label: "Alerts",      icon: <AlertIcon />, badge: alertCount || null },
    ] : []),
  ];

  return (
    <>
      <style>{sidebarStyles}</style>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <ShieldIcon size={18} color="#1a1208" />
          </div>
          <div>
            <div className="sidebar-logo-text">GovernAI</div>
            <div className="sidebar-logo-sub">Access Intelligence</div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{user.avatar}</div>
          <div>
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} · Level {user.level}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item${page === item.id ? " active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.icon}
              {item.label}
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="sidebar-logout">
          <button className="logout-btn" onClick={onLogout}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}