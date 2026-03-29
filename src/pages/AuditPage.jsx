// src/pages/AuditPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Audit Logs Page - Category column removed
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { LogIcon } from "../components/Icons";
import { getRoleBadgeClass, formatDateTime } from "../utils/helpers";
import { getAuditLogs } from "../services/api";

const ROLES = ["intern", "employee", "manager", "executive", "hr_admin"];

export default function AuditPage({ logs: localLogs }) {
  const [allLogs,  setAllLogs]  = useState(localLogs);
  const [filters,  setFilters]  = useState({ user: "", role: "", decision: "" });
  const [loading,  setLoading]  = useState(true);
  const [source,   setSource]   = useState("local"); // "backend" | "local"

  // Try to fetch from backend on mount
  useEffect(() => {
    getAuditLogs()
      .then(data => {
        const rows = Array.isArray(data) ? data : (data.logs || []);
        setAllLogs(rows);
        setSource("backend");
      })
      .catch(() => {
        setAllLogs(localLogs);
        setSource("local");
      })
      .finally(() => setLoading(false));
  }, []);

  // Re-sync with local logs if backend isn't available
  useEffect(() => {
    if (source === "local") setAllLogs(localLogs);
  }, [localLogs, source]);

  const filtered = allLogs.filter(log => {
    const nameMatch = !filters.user ||
      (log.username || "").toLowerCase().includes(filters.user.toLowerCase()) ||
      (log.name     || "").toLowerCase().includes(filters.user.toLowerCase()) ||
      (log.user_email || "").toLowerCase().includes(filters.user.toLowerCase());

    const roleMatch     = !filters.role     || 
      (log.role || "").toLowerCase() === filters.role.toLowerCase() || 
      (log.role_name || "").toLowerCase() === filters.role.toLowerCase();

    const decisionMatch = !filters.decision || 
      (log.decision || "").toLowerCase() === filters.decision.toLowerCase();

    return nameMatch && roleMatch && decisionMatch;
  });

  // Normalise a log row
  function normLog(log) {
    return {
      id:        log.id,
      timestamp: log.timestamp,
      name:      log.name      || log.user_name || "Unknown",
      username:  log.username  || log.user_email || "",
      role:      log.role      || log.role_name  || "—",
      query:     log.query     || log.query_text || "—",
      decision:  log.decision  || "—",
      action:    log.action    || log.deny_reason || "—",
    };
  }

  return (
    <>
      <div className="page-header">
        <LogIcon />
        <span className="page-header-title">Audit Logs</span>
        <span className="page-header-sub">
          — {allLogs.length} entries
          {source === "backend"
            ? <span style={{ marginLeft: 8, fontSize: 11, background: "#e6f5ee", color: "#1a6e3e", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>● Live</span>
            : <span style={{ marginLeft: 8, fontSize: 11, background: "#fff3d6", color: "#8b5800", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>⚡ Session only</span>
          }
        </span>
      </div>

      <div className="page-body">
        <div className="filter-bar">
          <input
            className="form-input"
            style={{ width: 200, height: 36, padding: "6px 12px" }}
            placeholder="Search user…"
            value={filters.user}
            onChange={e => setFilters(p => ({ ...p, user: e.target.value }))}
          />
          <select className="filter-select" value={filters.role} onChange={e => setFilters(p => ({ ...p, role: e.target.value }))}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="filter-select" value={filters.decision} onChange={e => setFilters(p => ({ ...p, decision: e.target.value }))}>
            <option value="">All Decisions</option>
            <option value="Allowed">Allowed</option>
            <option value="ALLOW">Allow</option>
            <option value="Denied">Denied</option>
            <option value="DENY">Deny</option>
          </select>
        </div>

        <div className="card">
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--charcoal3)" }}>Loading logs…</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="log-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Query</th>
                    <th>Decision</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "var(--charcoal3)", padding: 40 }}>
                        {allLogs.length === 0 
                          ? "No logs yet — queries will appear here after you use the chat." 
                          : "No matching log entries"}
                      </td>
                    </tr>
                  ) : filtered.map((raw, i) => {
                    const log = normLog(raw);
                    const dec = (log.decision || "").toLowerCase();

                    return (
                      <tr key={log.id || i}>
                        <td style={{ color: "var(--charcoal3)", whiteSpace: "nowrap", fontSize: 12 }}>
                          {formatDateTime(log.timestamp)}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{log.name}</div>
                          <div style={{ fontSize: 11, color: "var(--charcoal3)" }}>{log.username}</div>
                        </td>
                        <td>
                          <span className={`badge ${getRoleBadgeClass(log.role)}`}>{log.role}</span>
                        </td>
                        <td style={{ maxWidth: 320 }}>
                          <div style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} 
                               title={log.query}>
                            {log.query}
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${dec.includes("allow") ? "allowed" : dec.includes("deny") ? "denied" : "partial"}`}>
                            {log.decision}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--charcoal3)", maxWidth: 180 }}>
                          {log.action}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}