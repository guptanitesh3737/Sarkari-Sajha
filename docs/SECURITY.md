# SarkariSajha - Security & Compliance Protocols

## Core Security Directives

### 1. API Keys & Secrets Isolation
- Gemini API keys (`GEMINI_API_KEY`) and server secrets reside strictly server-side in `process.env`.
- No sensitive keys are ever exposed in client bundles or public `VITE_` variables.

### 2. Role-Based Access Control (RBAC)
- Client-side roles (`candidate`, `editor`, `admin`) are strictly enforced server-side.
- Super admin status cannot be assigned automatically or via client manipulation.

### 3. Government Information Authenticity Guard
- AI-extracted vacancy metadata MUST NOT be published directly without explicit admin audit.
- Official URLs and government notices are verified to prevent phishing or fraudulent application links.

### 4. Input Sanitization & Anti-Prompt Injection
- Candidate CV text and form submissions sent to Gemini model prompts are sanitized against prompt injection.
- API endpoints validate payload structure and type types before processing.

### 5. Google Workspace OAuth Security
- OAuth scopes restricted to required drive/spreadsheet permissions (`https://www.googleapis.com/auth/spreadsheets`, `drive.file`).
