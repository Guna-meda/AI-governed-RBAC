// src/utils/helpers.js

export function getRoleBadgeClass(role) {
  const map = {
    Admin:        "badge-admin",
    Manager:      "badge-manager",
    "HR Officer": "badge-hr",
    Engineer:     "badge-engineer",
    Intern:       "badge-intern",
  };
  return map[role] || "badge-admin";
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
