// src/App.jsx
import { useState, useEffect } from "react";
import "./styles/globals.css";

import { verifyToken, logout as apiLogout } from "./services/api";

import Sidebar       from "./components/Sidebar";
import LoginPage     from "./pages/LoginPage";
import ChatPage      from "./pages/ChatPage";
import AuditPage     from "./pages/AuditPage";
import DashboardPage from "./pages/DashboardPage";
import AlertsPage    from "./pages/AlertsPage";

let nextLogId = 1;

export default function App() {
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page,        setPage]        = useState("chat");
  const [logs,        setLogs]        = useState([]);

  // Restore session on mount
  useEffect(() => {
    verifyToken()
      .then(({ user: savedUser }) => {
        setUser(normaliseUser(savedUser));
      })
      .catch(() => {
        // Token invalid or missing → stay on login
      })
      .finally(() => setAuthLoading(false));
  }, []);

  function handleLogin(backendUser) {
    setUser(normaliseUser(backendUser));
    setPage("chat");
    setLogs([]); // fresh session
  }

  function handleLogout() {
    apiLogout();
    setUser(null);
    setLogs([]);
    setPage("chat");
  }

  // Called from ChatPage when a query finishes
  function handleNewLog(entry) {
    setLogs(prev => [{ id: nextLogId++, ...entry }, ...prev]);
  }

  if (authLoading) {
    return (
      <div className="loading-screen">
        Loading…
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  // Merge in-memory logs with backend-style logs for admin pages
  const displayLogs = logs.map(log => ({
    ...log,
    decision: (log.decision || "").toUpperCase(),
    role: log.role || log.role_name,
    name: log.name || log.user_name,
    user_email: log.user_email || log.username,
    category: log.category || log.resource_tags || "General",
    action: log.action || log.deny_reason || "—",
  }));

  const alerts = computeAlerts(displayLogs);
  const highAlerts = alerts.filter(a => a.severity === "high").length;

  // Admin check (supports both "executive" and "Admin" from backend)
  const isAdmin = ["executive", "Executive", "Admin", "admin"].includes(user.role);

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        page={page}
        onNavigate={setPage}
        onLogout={handleLogout}
        alertCount={highAlerts}
      />
      <div className="main-content">
        {page === "chat"      && <ChatPage user={user} onNewLog={handleNewLog} />}
        
        {page === "dashboard" && isAdmin && <DashboardPage logs={displayLogs} />}
        {page === "audit"     && isAdmin && <AuditPage logs={displayLogs} />}
        {page === "alerts"    && isAdmin && <AlertsPage alerts={alerts} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compute Alerts based on real audit logs
// ─────────────────────────────────────────────────────────────────────────────
function computeAlerts(logs) {
  const alerts = [];

  // 1. Repeated Denial Alert
  const denialCount = {};
  logs.forEach(log => {
    if (log.decision === "DENY" || log.decision === "DENIED") {
      const key = log.user_email || log.name || "unknown";
      denialCount[key] = (denialCount[key] || 0) + 1;

      if (denialCount[key] >= 3) {
        alerts.push({
          type: "repeated_denial",
          severity: "high",
          message: `${log.name || log.user_email} has multiple access denials.`,
          timestamp: log.timestamp
        });
      }
    }
  });

  // 2. Out-of-Scope Access Attempt
  logs.forEach(log => {
    if ((log.decision === "DENY" || log.decision === "DENIED") && 
        log.category && 
        !alerts.some(a => a.message.includes(log.name || log.user_email))) {
      alerts.push({
        type: "out_of_scope",
        severity: "medium",
        message: `Out-of-scope access attempt by ${log.name || log.user_email}`,
        timestamp: log.timestamp
      });
    }
  });

  // Limit to latest 8 alerts
  return alerts.slice(0, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalise user shape from backend
// ─────────────────────────────────────────────────────────────────────────────
function normaliseUser(u) {
  const role = (u.role || u.role_name || "employee").toLowerCase();
  const level = u.role_level ?? u.level ?? 1;

  const parts = (u.name || "").split(" ");
  const avatar = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (u.name || "?").slice(0, 2).toUpperCase();

  const deptMap = {
    intern:     "Engineering",
    employee:   "Operations",
    manager:    "Management",
    executive:  "Executive",
    "hr admin": "Human Resources",
    admin:      "IT Security",
  };

  return {
    ...u,
    role,
    level,
    avatar,
    username: u.email || u.username || "",
    department: deptMap[role] || "General",
  };
}