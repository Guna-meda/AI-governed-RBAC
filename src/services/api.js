// src/services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// ALL backend communication goes through this file.
// Every function here maps 1-to-1 to a backend route:
//
//   POST /api/auth/login        → login()
//   POST /api/auth/register     → register()
//   GET  /api/auth/me           → verifyToken()
//   POST /api/query             → sendQuery()
//   GET  /api/query/access      → getMyAccess()
//   GET  /api/audit/logs        → getAuditLogs()
//
// The frontend never calls fetch() directly — it always calls one of these.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "https://ai-governed-rbac-backend.onrender.com";

// ─── Token helpers ────────────────────────────────────────────────────────────
// Store JWT in localStorage so the user stays logged in on page refresh

export function saveToken(token) {
  localStorage.setItem("governai_token", token);
}

export function getToken() {
  return localStorage.getItem("governai_token");
}

export function clearToken() {
  localStorage.removeItem("governai_token");
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
// Automatically attaches the JWT header and parses JSON

async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Parse body regardless of status (error responses also have JSON bodies)
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Throw with the server's error message if available
    const err = new Error(data.error || `HTTP ${response.status}`);
    err.status = response.status;
    err.data   = data;
    throw err;
  }

  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Login with email + password.
 * On success, saves the token and returns the user object.
 *
 * Backend returns:
 * { token, user: { id, name, email, role, role_level } }
 */
export async function login(email, password) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveToken(data.token);
  return data.user; // { id, name, email, role, role_level }
}

/**
 * Check if the stored token is still valid.
 * Returns user object if valid, throws if not.
 */
export async function verifyToken() {
  return apiFetch("/api/auth/me"); // { valid: true, user: {...} }
}

/**
 * Clear token from storage (logout).
 */
export function logout() {
  clearToken();
}

// ─── AI Query ─────────────────────────────────────────────────────────────────

/**
 * Send a query to the AI.
 * The backend enforces access control and returns:
 *
 * ALLOW:  { decision: "ALLOW",  answer: "...", sources: [...] }
 * DENY:   { decision: "DENY",   message: "...", user_role, user_level }
 * ERROR:  throws with err.status = 500
 */
export async function sendQuery(queryText, conversationHistory = []) {
  return apiFetch("/api/query", {
    method: "POST",
    body: JSON.stringify({
      query: queryText,
      conversation_history: conversationHistory,
    }),
  });
}

/**
 * Get the current user's permission profile.
 * Returns: { user: {...}, permissions: [{ resource, display_name, access }] }
 */
export async function getMyAccess() {
  return apiFetch("/api/query/access");
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

/**
 * Fetch audit logs from the backend (admin only).
 * Returns: { logs: [...], total: N }
 */
export async function getAuditLogs() {
  return apiFetch("/api/audit/logs");
}
