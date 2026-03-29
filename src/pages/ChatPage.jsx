// src/pages/ChatPage.jsx
import { ShieldIcon, SendIcon } from "../components/Icons";
import ChatMessage, { ThinkingBubble } from "../components/ChatMessage";
import { useChat } from "../hooks/useChat";

const chatStyles = `
  .chat-layout { display: flex; height: calc(100vh - var(--header-h)); }
  .chat-main   { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .chat-messages {
    flex: 1; overflow-y: auto; padding: 24px;
    display: flex; flex-direction: column; gap: 20px;
  }
  .chat-welcome { text-align: center; padding: 60px 20px; }
  .chat-welcome-icon {
    width: 56px; height: 56px; background: var(--cream2); border-radius: 16px;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
  }
  .chat-welcome-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--charcoal); margin-bottom: 8px; }
  .chat-welcome-sub   { font-size: 14px; color: var(--charcoal3); max-width: 360px; margin: 0 auto; }

  .chat-input-area {
    padding: 16px 24px; background: white; border-top: 1px solid var(--cream3);
  }
  .chat-input-row { display: flex; gap: 10px; align-items: flex-end; }
  .chat-textarea {
    flex: 1; padding: 12px 16px;
    border: 1.5px solid var(--cream3); border-radius: 12px;
    font-size: 14px; font-family: 'DM Sans', sans-serif; color: var(--charcoal);
    resize: none; outline: none; line-height: 1.5;
    min-height: 44px; max-height: 120px;
    background: var(--cream); transition: border-color 0.15s;
  }
  .chat-textarea:focus { border-color: var(--gold); background: white; }
  .send-btn {
    width: 44px; height: 44px;
    background: var(--charcoal); border: none; border-radius: 10px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: background 0.15s;
  }
  .send-btn:hover    { background: var(--charcoal2); }
  .send-btn:disabled { background: var(--cream3); cursor: not-allowed; }
  .chat-hint { font-size: 11.5px; color: var(--charcoal3); margin-top: 8px; }

  .suggestion-btn {
    padding: 7px 14px;
    border: 1.5px solid var(--cream3); border-radius: 20px;
    background: white; font-size: 12.5px; color: var(--charcoal2);
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: border-color 0.15s;
  }
  .suggestion-btn:hover { border-color: var(--gold); }
`;

const SUGGESTIONS = [
  "Show me the payroll summary",
  "What does our API architecture look like?",
  "Can you share the HR records?",
  "Tell me about company policy",
];

export default function ChatPage({ user, onNewLog }) {
  const { messages, inputVal, setInputVal, thinking, messagesEndRef, sendMessage } = useChat(user, onNewLog);

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { 
      e.preventDefault(); 
      sendMessage(); 
    }
  }

  return (
    <>
      <style>{chatStyles}</style>
      <div className="page-header">
        <ShieldIcon size={18} color="var(--warm-brown)" />
        <span className="page-header-title">AI Assistant</span>
        <span className="page-header-sub">— governed by your access policy</span>
      </div>

      <div className="chat-layout">
        {/* Messages area - now takes full width */}
        <div className="chat-main" style={{ flex: "1" }}>
          <div className="chat-messages">
            {messages.length === 0 && !thinking && (
              <div className="chat-welcome">
                <div className="chat-welcome-icon">
                  <ShieldIcon size={26} color="var(--warm-brown)" />
                </div>
                <div className="chat-welcome-title">Hello, {user.name.split(" ")[0]}</div>
                <div className="chat-welcome-sub">
                  Ask anything. Responses are filtered in real-time based on your role, department, and clearance level.
                </div>
                <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} className="suggestion-btn" onClick={() => setInputVal(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} userAvatar={user.avatar} />
            ))}

            {thinking && <ThinkingBubble />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="chat-input-area">
            <div className="chat-input-row">
              <textarea
                className="chat-textarea"
                rows={1}
                placeholder="Ask anything — access is enforced by policy…"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={handleKey}
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={!inputVal.trim() || thinking}
              >
                <SendIcon />
              </button>
            </div>
            <div className="chat-hint">
              Responses are governed by your NRL policy · Level {user.level} · {user.department}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}