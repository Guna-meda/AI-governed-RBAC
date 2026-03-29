// src/components/ChatMessage.jsx
import { formatTime } from "../utils/helpers";

const msgStyles = `
  .msg-row { display: flex; gap: 12px; animation: fadeUp 0.3s ease; }
  .msg-row.user { flex-direction: row-reverse; }
  .msg-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px;
  }
  .msg-avatar.ai      { background: var(--charcoal); color: var(--gold); }
  .msg-avatar.user-av { background: var(--gold); color: var(--charcoal); }
  .msg-bubble { max-width: 75%; }
  .msg-bubble.user .msg-text { background: var(--charcoal); color: white; border-radius: 16px 16px 4px 16px; }
  .msg-bubble.ai   .msg-text { background: white; border: 1px solid var(--cream3); border-radius: 16px 16px 16px 4px; color: var(--charcoal); }
  .msg-text { padding: 12px 16px; font-size: 14px; line-height: 1.6; }
  .msg-text.denied  { background: #fff8f8 !important; border-color: #f0c0c0 !important; }
  .msg-text.partial { background: #fffdf5 !important; border-color: #f0e0b0 !important; }
  .msg-meta { display: flex; align-items: center; gap: 6px; padding: 6px 4px; }
  .msg-time { font-size: 11px; color: var(--charcoal3); }
  .msg-status-pill { display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
  .msg-status-allowed { background: #e6f5ee; color: #1a6e3e; }
  .msg-status-denied  { background: #fde8e8; color: #8b2020; }
  .msg-status-partial { background: #fff3d6; color: #8b5800; }
  .redacted-block { background: var(--charcoal); color: transparent; border-radius: 4px; user-select: none; display: inline; }
  .denied-block {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 14px; background: #fff0f0;
    border: 1px solid #f5c0c0; border-radius: 12px;
  }
  .denied-icon { font-size: 16px; flex-shrink: 0; color: var(--rose); }
`;

function AiMessageBody({ msg }) {
  if (msg.decision === "Denied") {
    return (
      <div className="denied-block">
        <div className="denied-icon">🔒</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: "#8b2020", marginBottom: 4 }}>Access Denied</div>
          <div style={{ fontSize: 13, color: "#6b3030", lineHeight: 1.6 }}>{msg.reason}</div>
        </div>
      </div>
    );
  }

  if (msg.decision === "Partial") {
    const parts = msg.text.split("[REDACTED SECTION");
    return (
      <div className="msg-text partial">
        {parts[0]}
        {parts.length > 1 && (
          <>
            <span className="redacted-block">████████████████████████████</span>
            <span style={{ fontSize: 11, background: "#fff3d6", color: "#8b5800", padding: "1px 6px", borderRadius: 4, margin: "0 4px", fontWeight: 600 }}>
              REDACTED
            </span>
            {parts[1].replace(/^[^\]]*\]/, "")}
          </>
        )}
      </div>
    );
  }

  return <div className="msg-text">{msg.text}</div>;
}

export function ThinkingBubble() {
  return (
    <div className="msg-row">
      <div className="msg-avatar ai">AI</div>
      <div className="msg-bubble ai">
        <div className="msg-text" style={{ color: "var(--charcoal3)" }}>
          <span className="thinking-dots">
            <span>●</span><span>●</span><span>●</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChatMessage({ msg, userAvatar }) {
  const isUser = msg.role === "user";

  return (
    <>
      <style>{msgStyles}</style>
      <div className={`msg-row ${isUser ? "user" : ""}`}>
        <div className={`msg-avatar ${isUser ? "user-av" : "ai"}`}>
          {isUser ? userAvatar : "AI"}
        </div>
        <div className={`msg-bubble ${isUser ? "user" : "ai"}`}>
          {isUser
            ? <div className="msg-text">{msg.text}</div>
            : <AiMessageBody msg={msg} />
          }
          <div className="msg-meta">
            <span className="msg-time">{formatTime(msg.time)}</span>
            {!isUser && msg.decision && (
              <span className={`msg-status-pill msg-status-${msg.decision.toLowerCase()}`}>
                {msg.decision === "Allowed" ? "✓" : msg.decision === "Denied" ? "✗" : "~"} {msg.decision}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
