// src/pages/DashboardPage.jsx
import { DashIcon } from "../components/Icons";
import { getRoleBadgeClass } from "../utils/helpers";

function BarChart({ data, maxVal, color }) {
  return data.map(([label, count]) => (
    <div key={label} className="chart-bar-row">
      <div className="chart-bar-label" title={label}>{label}</div>
      <div className="chart-bar-track">
        <div className="chart-bar-fill" style={{ width: `${Math.round(count / maxVal * 100)}%`, background: color }} />
      </div>
      <div className="chart-bar-val">{count}</div>
    </div>
  ));
}

export default function DashboardPage({ logs }) {
  const total = logs.length;

  const getDecisionCount = (decisions) => logs.filter(l => 
    decisions.includes((l.decision || "").toUpperCase())
  ).length;

  const allowed = getDecisionCount(["ALLOW", "ALLOWED"]);
  const denied  = getDecisionCount(["DENY", "DENIED"]);
  const partial = getDecisionCount(["PARTIAL", "NOT_FOUND"]);

  // ... rest of your component stays exactly the same ...
  const catCounts = {};
  logs.forEach(l => { if (l.category) catCounts[l.category] = (catCounts[l.category] || 0) + 1; });
  const catSorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCat = catSorted[0]?.[1] || 1;

  const deniedCat = {};
  logs.filter(l => (l.decision || "").toUpperCase() === "DENY")
      .forEach(l => { if (l.category) deniedCat[l.category] = (deniedCat[l.category] || 0) + 1; });
  const deniedSorted = Object.entries(deniedCat).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxDenied = deniedSorted[0]?.[1] || 1;

  const roleActive = {};
  logs.forEach(l => { roleActive[l.role || l.role_name] = (roleActive[l.role || l.role_name] || 0) + 1; });

  const pct = n => total > 0 ? Math.round(n / total * 100) : 0;

  return (
    <>
      <div className="page-header">
        <DashIcon />
        <span className="page-header-title">Dashboard</span>
        <span className="page-header-sub">— governance overview</span>
      </div>

      <div className="page-body">
        {/* Stat cards */}
        <div className="stat-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Total Queries</div>
            <div className="stat-value">{total}</div>
            <div className="stat-sub">All interactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Allowed</div>
            <div className="stat-value" style={{ color: "var(--teal)" }}>{allowed}</div>
            <div className="stat-sub"><span className="stat-dot" style={{ background: "var(--teal)" }} />{pct(allowed)}% of total</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Denied</div>
            <div className="stat-value" style={{ color: "var(--rose)" }}>{denied}</div>
            <div className="stat-sub"><span className="stat-dot" style={{ background: "var(--rose)" }} />{pct(denied)}% of total</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Partial / Not Found</div>
            <div className="stat-value" style={{ color: "var(--amber)" }}>{partial}</div>
            <div className="stat-sub"><span className="stat-dot" style={{ background: "var(--amber)" }} />{pct(partial)}% of total</div>
          </div>
        </div>

        {/* Bar charts and Activity by Role - unchanged from your original code */}
        {/* (copy the rest of your original DashboardPage.jsx from here down) */}
      </div>
    </>
  );
}