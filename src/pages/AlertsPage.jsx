// src/pages/AlertsPage.jsx
import { AlertIcon } from "../components/Icons";

export default function AlertsPage({ alerts }) {
  return (
    <>
      <div className="page-header">
        <AlertIcon />
        <span className="page-header-title">Alerts</span>
        <span className="page-header-sub">— {alerts.length} suspicious activities</span>
      </div>

      <div className="page-body">
        {alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✓</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>No alerts at this time</div>
            <div style={{ fontSize: 13 }}>The system is operating within normal parameters.</div>
          </div>
        ) : alerts.map((alert, i) => (
          <div key={i} className="alert-item">
            <div className={`alert-icon ${alert.severity}`}>
              {alert.severity === "high"
                ? <span style={{ fontSize: 16, color: "var(--rose)" }}>⚠</span>
                : <span style={{ fontSize: 16, color: "var(--amber)" }}>⚑</span>
              }
            </div>
            <div>
              <div className="alert-msg">{alert.message}</div>
              <div className={`alert-type ${alert.severity}`}>
                {alert.type === "repeated_denial" ? "Repeated Denial" : "Out of Scope Access"} · {alert.severity.toUpperCase()} severity
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
