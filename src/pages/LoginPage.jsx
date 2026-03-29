// src/pages/LoginPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Calls POST /api/auth/login.
// Demo buttons use the real backend credentials from seed.js.
// Falls back gracefully if the backend is unreachable.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { login as apiLogin } from "../services/api";
import { ShieldIcon } from "../components/Icons";

// These match exactly what seed.js inserts into the database
const DEMO_USERS = [
  { name: "Alice Sharma",  email: "alice@company.com",  password: "password123", role: "Intern",    level: 1 },
  { name: "Bob Mehta",     email: "bob@company.com",    password: "password123", role: "Employee",  level: 2 },
  { name: "Carol Nair",    email: "carol@company.com",  password: "password123", role: "Manager",   level: 3 },
  { name: "David Rao",     email: "david@company.com",  password: "password123", role: "Executive", level: 4 },
  { name: "Eva Krishnan",  email: "eva@company.com",    password: "password123", role: "HR Admin",  level: 3 },
];

const loginStyles = `
  .login-page { min-height: 100vh; background: var(--cream); display: flex; }
  .login-left {
    flex: 1; background: var(--charcoal);
    display: flex; flex-direction: column;
    justify-content: center; padding: 60px;
    position: relative; overflow: hidden;
  }
  .login-left::before {
    content: ''; position: absolute; top: -120px; right: -120px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(201,153,62,0.12) 0%, transparent 70%);
    border-radius: 50%;
  }
  .login-left::after {
    content: ''; position: absolute; bottom: -80px; left: -80px;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(201,153,62,0.08) 0%, transparent 70%);
    border-radius: 50%;
  }
  .login-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 60px; position: relative; z-index: 1; }
  .login-brand-icon { width: 44px; height: 44px; background: var(--gold); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .login-brand-name { font-family: 'DM Serif Display', serif; font-size: 22px; color: white; }
  .login-brand-sub  { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; }
  .login-headline { font-family: 'DM Serif Display', serif; font-size: 38px; color: white; line-height: 1.2; margin-bottom: 20px; position: relative; z-index: 1; }
  .login-headline span { color: var(--gold); }
  .login-desc { font-size: 14px; color: rgba(255,255,255,0.5); max-width: 340px; line-height: 1.7; position: relative; z-index: 1; }
  .login-features { margin-top: 48px; display: flex; flex-direction: column; gap: 16px; position: relative; z-index: 1; }
  .login-feature { display: flex; align-items: center; gap: 12px; font-size: 13px; color: rgba(255,255,255,0.6); }
  .login-feature-dot { width: 6px; height: 6px; background: var(--gold); border-radius: 50%; flex-shrink: 0; }
  .login-right { flex: 0 0 480px; display: flex; align-items: center; justify-content: center; padding: 40px; }
  .login-form-box  { width: 100%; max-width: 400px; }
  .login-form-title { font-family: 'DM Serif Display', serif; font-size: 28px; color: var(--charcoal); margin-bottom: 6px; }
  .login-form-sub   { font-size: 14px; color: var(--charcoal3); margin-bottom: 32px; }
  .login-btn {
    width: 100%; padding: 12px; background: var(--charcoal); color: white;
    border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.15s; font-family: 'DM Sans', sans-serif; margin-top: 4px;
  }
  .login-btn:hover:not(:disabled) { background: var(--charcoal2); }
  .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .login-divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
  .login-divider-line { flex: 1; height: 1px; background: var(--cream3); }
  .login-divider-text { font-size: 12px; color: var(--charcoal3); }
  .demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .demo-btn {
    padding: 9px 12px; border: 1.5px solid var(--cream3); border-radius: 9px;
    background: var(--cream); font-size: 12px; cursor: pointer; text-align: left;
    transition: all 0.15s; font-family: 'DM Sans', sans-serif;
  }
  .demo-btn:hover:not(:disabled) { border-color: var(--gold); background: var(--gold-pale); }
  .demo-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .demo-btn-name { font-weight: 600; color: var(--charcoal); font-size: 12.5px; }
  .demo-btn-role { color: var(--charcoal3); font-size: 11px; }
  .backend-notice {
    font-size: 11.5px; color: var(--charcoal3); margin-top: 16px;
    padding: 8px 12px; background: var(--cream2); border-radius: 8px;
    border: 1px solid var(--cream3);
  }
`;

const FEATURES = [
  "NIST SP 800-53 Aligned Access Control",
  "Real-time Policy Enforcement Engine",
  "Immutable Audit Trail & Compliance Logs",
  "Suspicious Activity Detection",
];

export default function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    await doLogin(email.trim(), password);
  }

  async function doLogin(emailVal, passwordVal) {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const user = await apiLogin(emailVal, passwordVal);
      onLogin(user);
    } catch (err) {
      if (err.status === 401) {
        setError("Invalid email or password.");
      } else if (err.status === 403) {
        setError("Your account has been disabled.");
      } else {
        setError("Could not reach the server. Make sure the backend is running on port 3000.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{loginStyles}</style>
      <div className="login-page">
        {/* ── Left panel ── */}
        <div className="login-left">
          <div className="login-brand">
            <div className="login-brand-icon"><ShieldIcon size={22} color="#1a1208" /></div>
            <div>
              <div className="login-brand-name">GovernAI</div>
              <div className="login-brand-sub">Enterprise Platform</div>
            </div>
          </div>
          <div className="login-headline">
            Role-Aware AI<br />for <span>Compliant</span><br />Organizations
          </div>
          <div className="login-desc">
            AI responses governed by your role, department, and clearance level. Every interaction audited.
          </div>
          <div className="login-features">
            {FEATURES.map(f => (
              <div key={f} className="login-feature">
                <div className="login-feature-dot" />{f}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right">
          <div className="login-form-box">
            <div className="login-form-title">Sign in</div>
            <div className="login-form-sub">Enter your credentials or use a demo account</div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="e.g. alice@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
              {error && <div className="form-error">⚠ {error}</div>}
              <button className="login-btn" type="submit" disabled={loading} style={{ marginTop: 16 }}>
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="login-divider">
              <div className="login-divider-line" />
              <div className="login-divider-text">or try a demo account</div>
              <div className="login-divider-line" />
            </div>

            <div className="demo-grid">
              {DEMO_USERS.map(u => (
                <button
                  key={u.email}
                  className="demo-btn"
                  disabled={loading}
                  onClick={() => doLogin(u.email, u.password)}
                >
                  <div className="demo-btn-name">{u.name.split(" ")[0]}</div>
                  <div className="demo-btn-role">{u.role} · L{u.level}</div>
                </button>
              ))}
            </div>

            <div className="backend-notice">
              🔗 Connecting to backend at <strong>localhost:3000</strong> — make sure it's running.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
