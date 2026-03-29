// src/components/AccessPanel.jsx
import { ShieldIcon } from "./Icons";

export default function AccessPanel({ user, lastDecision }) {
  // Safe fallbacks
  const decision = lastDecision?.decision || "—";
  const reason   = lastDecision?.reason   || "Ask a question to see the access decision";
  const category = lastDecision?.category || "General";

  // Prevent .length error by ensuring arrays
  const allowedDocs = Array.isArray(lastDecision?.allowedDocs) ? lastDecision.allowedDocs : [];
  const blockedDocs = Array.isArray(lastDecision?.blockedDocs) ? lastDecision.blockedDocs : [];
  const matchedDocs = Array.isArray(lastDecision?.matchedDocs) ? lastDecision.matchedDocs : [];

  const isAllowed = decision.toLowerCase().includes("allow");
  const isDenied  = decision.toLowerCase().includes("deny");

  return (
    <div className="access-panel">
      <div className="access-header">
        <ShieldIcon size={20} />
        <span>Access Decision</span>
      </div>

      <div className={`decision-badge ${isAllowed ? "allowed" : isDenied ? "denied" : "partial"}`}>
        {decision}
      </div>

      <div className="access-info">
        <div><strong>User:</strong> {user?.name} ({user?.role} • L{user?.level})</div>
        <div><strong>Category:</strong> {category}</div>
      </div>

      <div className="access-reason">
        <strong>Reason:</strong> {reason}
      </div>

      {/* Documents Section - only render if there are docs */}
      {(allowedDocs.length > 0 || blockedDocs.length > 0 || matchedDocs.length > 0) && (
        <div className="documents-section">
          <h4>Documents</h4>
          
          {allowedDocs.length > 0 && (
            <div className="doc-list allowed">
              <strong>Allowed ({allowedDocs.length})</strong>
              <ul>
                {allowedDocs.map((doc, i) => (
                  <li key={i}>
                    {doc.text || doc.title || `Document ${i+1}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {blockedDocs.length > 0 && (
            <div className="doc-list blocked">
              <strong>Blocked ({blockedDocs.length})</strong>
              <ul>
                {blockedDocs.map((doc, i) => (
                  <li key={i}>
                    {doc.title || doc.text || "Restricted content"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {decision === "—" && (
        <div className="access-empty">
          Ask a question in the chat to see real-time access control.
        </div>
      )}
    </div>
  );
}