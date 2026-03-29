// src/hooks/useChat.js
import { useState, useRef, useEffect } from "react";
import { sendQuery } from "../services/api";

export function useChat(user, onNewLog) {
  const [messages,     setMessages]     = useState([]);
  const [inputVal,     setInputVal]     = useState("");
  const [thinking,     setThinking]     = useState(false);
  const [lastDecision, setLastDecision] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function sendMessage() {
    if (!inputVal.trim() || thinking) return;

    const query = inputVal.trim();
    setInputVal("");
    setMessages(prev => [...prev, { 
      role: "user", 
      text: query, 
      time: new Date().toISOString() 
    }]);
    setThinking(true);

    let backendDecision = "NOT_FOUND";
    let answerText = "Sorry, I couldn't process your request.";
    let sources = [];
    let denyReason = null;

    try {
      const res = await sendQuery(query);

      backendDecision = res.decision || "NOT_FOUND";
      answerText      = res.answer || res.message || "";
      sources         = res.sources || [];

      if (backendDecision === "DENY") {
        denyReason = res.message || "Insufficient role level";
      }

    } catch (err) {
      console.warn("Backend query failed:", err.message);
      if (err.status === 403) {
        backendDecision = "DENY";
        answerText = err.data?.message || "Access denied by policy.";
        denyReason = "Insufficient role level";
      } else {
        answerText = "Sorry, the AI service is currently unavailable.";
      }
    }

    const uiDecision = backendDecision === "ALLOW" ? "Allowed"
                     : backendDecision === "DENY"  ? "Denied"
                     : "Partial";

    // Safe AccessPanel data
    const accessResult = {
      decision: uiDecision,
      reason: backendDecision === "DENY" 
        ? (denyReason || "You do not have permission to access this information.")
        : "Response generated based on your access rights.",
      category: detectCategory(query),
      matchedDocs: sources || [],
      allowedDocs: backendDecision === "ALLOW" ? (sources || []) : [],
      blockedDocs: backendDecision === "DENY" ? [{ title: "Restricted content" }] : [],
    };

    setLastDecision(accessResult);

    // Send log to App.jsx for Audit + Dashboard
    onNewLog({
      timestamp: new Date().toISOString(),
      name:      user.name,
      username:  user.email || user.username,
      role:      user.role,
      query:     query,
      decision:  uiDecision,
      category:  accessResult.category,
      action:    backendDecision === "DENY" 
        ? (denyReason || "Access denied") 
        : "Full response delivered",
      answer:    answerText,
    });

    // Add AI message to chat
    setMessages(prev => [...prev, {
      role:     "ai",
      text:     answerText,
      decision: uiDecision,
      reason:   accessResult.reason,
      time:     new Date().toISOString(),
    }]);

    setThinking(false);
  }

  return {
    messages,
    inputVal,
    setInputVal,
    thinking,
    lastDecision,
    messagesEndRef,
    sendMessage,
  };
}

function detectCategory(query) {
  const q = query.toLowerCase();
  if (q.includes("payroll") || q.includes("salary")) return "Payroll";
  if (q.includes("hr") || q.includes("employee")) return "HR Records";
  if (q.includes("api") || q.includes("architecture")) return "Engineering Docs";
  if (q.includes("policy") || q.includes("handbook")) return "Company Policy";
  return "General";
}