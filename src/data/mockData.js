// src/data/mockData.js
// All static data, constants, and simulation logic lives here

export const DEMO_USERS = [
  { id: 1, username: "alice.admin",    password: "admin123",   name: "Alice Chen",     role: "Admin",      department: "IT Security",     level: 5, avatar: "AC" },
  { id: 2, username: "bob.manager",    password: "manager123", name: "Bob Reynolds",   role: "Manager",    department: "Finance",         level: 3, avatar: "BR" },
  { id: 3, username: "carol.hr",       password: "hr123",      name: "Carol Singh",    role: "HR Officer", department: "Human Resources", level: 3, avatar: "CS" },
  { id: 4, username: "dave.engineer",  password: "eng123",     name: "Dave Kowalski",  role: "Engineer",   department: "Engineering",     level: 2, avatar: "DK" },
  { id: 5, username: "eve.intern",     password: "intern123",  name: "Eve Patel",      role: "Intern",     department: "Engineering",     level: 1, avatar: "EP" },
];

export const ROLE_COLORS = {
  Admin:      { bg: "#1a1a2e", text: "#e8c96f", border: "#e8c96f" },
  Manager:    { bg: "#0f3460", text: "#7eb8f7", border: "#7eb8f7" },
  "HR Officer": { bg: "#2d1b4e", text: "#c084fc", border: "#c084fc" },
  Engineer:   { bg: "#0d3b2e", text: "#6ee7b7", border: "#6ee7b7" },
  Intern:     { bg: "#3b2200", text: "#fbbf24", border: "#fbbf24" },
};

export const DEPT_SENSITIVITY = {
  Payroll:            { level: 4, owner: ["Admin", "Manager", "HR Officer"] },
  "HR Records":       { level: 3, owner: ["Admin", "HR Officer"] },
  "Financial Reports":{ level: 4, owner: ["Admin", "Manager"] },
  "Engineering Docs": { level: 2, owner: ["Admin", "Manager", "Engineer", "Intern"] },
  "Company Policy":   { level: 1, owner: ["Admin", "Manager", "HR Officer", "Engineer", "Intern"] },
  "Security Logs":    { level: 5, owner: ["Admin"] },
  "Project Plans":    { level: 2, owner: ["Admin", "Manager", "Engineer"] },
  "Legal Documents":  { level: 4, owner: ["Admin", "Manager"] },
};

export const MOCK_DOCS = [
  { id: "d1",  title: "Q4 Payroll Report",         category: "Payroll",             sensitivity: 4 },
  { id: "d2",  title: "HR Complaint Records",       category: "HR Records",          sensitivity: 3 },
  { id: "d3",  title: "Annual Financial Summary",   category: "Financial Reports",   sensitivity: 4 },
  { id: "d4",  title: "API Architecture Guide",     category: "Engineering Docs",    sensitivity: 2 },
  { id: "d5",  title: "Employee Handbook",          category: "Company Policy",      sensitivity: 1 },
  { id: "d6",  title: "Server Access Logs",         category: "Security Logs",       sensitivity: 5 },
  { id: "d7",  title: "Sprint Roadmap Q1",          category: "Project Plans",       sensitivity: 2 },
  { id: "d8",  title: "NDA Templates",              category: "Legal Documents",     sensitivity: 4 },
  { id: "d9",  title: "Benefits Summary 2024",      category: "Payroll",             sensitivity: 3 },
  { id: "d10", title: "Salary Bands",               category: "Payroll",             sensitivity: 5 },
];

const FULL_RESPONSES = {
  Payroll:           "Based on payroll records: The organization maintains competitive compensation packages. Q4 payroll reflects a 3.2% merit increase across eligible employees. Benefits contributions remain stable at current levels.",
  "HR Records":      "HR documentation review: Employee records are maintained per policy. Complaint resolution averages 8.5 business days. All cases are handled confidentially per HR protocol.",
  "Financial Reports":"Financial summary: Q4 revenue reached targets with a 12% YoY growth. Operating costs were contained within budget. Detailed breakdowns are available in the attached financial statements.",
  "Engineering Docs":"Engineering documentation: The current API architecture follows RESTful principles with OAuth 2.0 authentication. Microservices are deployed via Kubernetes. Code review standards require 2 approvals before merge.",
  "Company Policy":  "Company policy overview: The employee handbook outlines standard procedures for PTO, conduct, and benefits. All employees are expected to complete annual compliance training. Policy updates are communicated quarterly.",
  "Security Logs":   "Security log analysis: Access logs reviewed. No anomalies detected in the current review period. All authentication attempts are within normal parameters.",
  "Project Plans":   "Project roadmap: Q1 sprint goals include API optimization, dashboard redesign, and performance benchmarking. Current velocity is on track to meet quarterly OKRs.",
  "Legal Documents": "Legal document summary: NDA templates are standardized and approved by legal counsel. All vendor agreements include data privacy clauses per GDPR and CCPA requirements.",
  General:           "Based on available documents: I can provide information within your authorized access scope. Please specify a more targeted query for detailed results.",
};

function detectCategory(query) {
  const q = query.toLowerCase();
  if (q.includes("payroll") || q.includes("salary") || q.includes("compensation")) return "Payroll";
  if (q.includes("hr") || q.includes("complaint") || q.includes("employee record"))  return "HR Records";
  if (q.includes("financial") || q.includes("revenue") || q.includes("budget"))      return "Financial Reports";
  if (q.includes("security") || q.includes("access log"))                            return "Security Logs";
  if (q.includes("legal") || q.includes("nda") || q.includes("contract"))            return "Legal Documents";
  if (q.includes("engineer") || q.includes("api") || q.includes("architecture"))     return "Engineering Docs";
  if (q.includes("project") || q.includes("sprint") || q.includes("roadmap"))        return "Project Plans";
  if (q.includes("policy") || q.includes("handbook") || q.includes("benefit"))       return "Company Policy";
  return "Company Policy";
}

export function simulateQuery(user, query) {
  const category    = detectCategory(query);
  const matchedDocs = MOCK_DOCS.filter(d => d.category === category);

  const allowedDocs = matchedDocs.filter(d => {
    const sens = DEPT_SENSITIVITY[d.category];
    return sens && sens.owner.includes(user.role) && user.level >= sens.level - 1;
  });
  const blockedDocs = matchedDocs.filter(d => !allowedDocs.includes(d));

  let decision, reason, response;

  if (allowedDocs.length === 0 && matchedDocs.length > 0) {
    decision = "Denied";
    reason   = `Your role (${user.role}, Level ${user.level}) does not have access to ${category} data.`;
    response = null;
  } else if (blockedDocs.length > 0) {
    decision = "Partial";
    reason   = `${blockedDocs.length} document(s) restricted due to insufficient clearance level.`;
    response = `Based on accessible documents in ${category}: This information is available to authorized personnel. Some details have been redacted based on your access level. [REDACTED SECTION - Requires Level ${Math.min(...blockedDocs.map(d => DEPT_SENSITIVITY[d.category]?.level || 5))} clearance] The accessible portions indicate standard organizational procedures are in place.`;
  } else {
    decision = "Allowed";
    reason   = "Full access granted based on role and level.";
    response = FULL_RESPONSES[category] || FULL_RESPONSES.General;
  }

  return { decision, reason, response, matchedDocs, allowedDocs, blockedDocs, category };
}

export function computeAlerts(logs) {
  const alerts = [];
  const deniedCounts = {};
  const outsideScope = [];

  logs.forEach(log => {
    if (log.decision === "Denied") {
      const key = `${log.username}::${log.category}`;
      deniedCounts[key] = (deniedCounts[key] || 0) + 1;
      const user = DEMO_USERS.find(u => u.username === log.username);
      if (user && DEPT_SENSITIVITY[log.category] && !DEPT_SENSITIVITY[log.category].owner.includes(user.role)) {
        outsideScope.push({ user, log });
      }
    }
  });

  Object.entries(deniedCounts).forEach(([key, count]) => {
    if (count >= 2) {
      const [username, category] = key.split("::");
      const user = DEMO_USERS.find(u => u.username === username);
      if (user) {
        alerts.push({
          type: "repeated_denial",
          severity: count >= 3 ? "high" : "medium",
          message: `${user.name} (${user.role}) attempted ${category} access ${count} times and was denied each time`,
          username, count,
        });
      }
    }
  });

  const seenOutside = new Set();
  outsideScope.forEach(({ user, log }) => {
    const key = `${user.username}::${log.category}`;
    if (!seenOutside.has(key)) {
      seenOutside.add(key);
      alerts.push({
        type: "out_of_scope",
        severity: "medium",
        message: `${user.name} (${user.role}, ${user.department}) requested ${log.category} — outside department scope`,
        username: user.username,
      });
    }
  });

  return alerts;
}

// Initial seed logs
export const INITIAL_LOGS = [
  { id: 1, timestamp: new Date(Date.now() - 3600000).toISOString(), username: "bob.manager",   name: "Bob Reynolds",  role: "Manager",    query: "Show me Q4 payroll summary",       decision: "Allowed",  reason: "Full access granted",             category: "Payroll",           action: "Full response delivered" },
  { id: 2, timestamp: new Date(Date.now() - 2700000).toISOString(), username: "eve.intern",    name: "Eve Patel",     role: "Intern",     query: "What are employee salary bands?",  decision: "Denied",   reason: "Intern role lacks payroll access", category: "Payroll",           action: "Access denied, no response" },
  { id: 3, timestamp: new Date(Date.now() - 1800000).toISOString(), username: "dave.engineer", name: "Dave Kowalski", role: "Engineer",   query: "API architecture documentation",   decision: "Allowed",  reason: "Full access granted",             category: "Engineering Docs",  action: "Full response delivered" },
  { id: 4, timestamp: new Date(Date.now() - 900000).toISOString(),  username: "eve.intern",    name: "Eve Patel",     role: "Intern",     query: "HR complaint records for Q3",      decision: "Denied",   reason: "Intern lacks HR access",          category: "HR Records",        action: "Access denied" },
  { id: 5, timestamp: new Date(Date.now() - 600000).toISOString(),  username: "carol.hr",      name: "Carol Singh",   role: "HR Officer", query: "Financial revenue report",         decision: "Denied",   reason: "HR role restricted from Finance", category: "Financial Reports", action: "Access denied" },
  { id: 6, timestamp: new Date(Date.now() - 300000).toISOString(),  username: "eve.intern",    name: "Eve Patel",     role: "Intern",     query: "Show payroll compensation data",   decision: "Denied",   reason: "Intern lacks payroll clearance",  category: "Payroll",           action: "Access denied, flagged" },
];
