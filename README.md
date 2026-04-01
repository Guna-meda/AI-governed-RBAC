#  AI-Governed RBAC System

View : https://ai-governed-rbac-8qww.vercel.app

An AI-powered governance layer that enforces **role-based and need-based access control** over AI-generated responses in an enterprise environment.

This system ensures that users only receive information they are authorized to access, while maintaining **auditability, transparency, and compliance**.

---

##  Overview

Traditional AI systems respond with all available knowledge, which can lead to **data leakage in enterprise environments**.

This project introduces a **governance layer** between users and AI:

- Every request is authenticated
- Access is evaluated using **Role + Level (NRL)**
- Responses are **filtered before reaching the AI**
- All decisions are **logged for auditing**

---

##  Core Concept

> AI is not the decision-maker.  
> Access control is the decision-maker. AI is just the response generator.

---

##  Features

-  **Role & Level-Based Access Control**
  - Roles: Intern, Employee, Manager, Executive, HR Admin
-  **Policy Engine**
  - Evaluates requests as `ALLOW` or `DENY`
-  **AI Query Gateway**
  - Sends only permitted data to the AI model
-  **Audit Logging**
  -Tracks all queries, decisions, and timestamps
-  **Secure-by-default AI responses**

---

This is a frontend folder for the AI-Governed RBAC System. The backend handles authentication, policy evaluation, and logging, while this frontend provides a user interface for making requests and viewing responses.
