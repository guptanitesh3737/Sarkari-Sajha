# SarkariSajha - System Architecture

## Architecture Overview
SarkariSajha follows a secure full-stack web application model running on Google Cloud Run containers.

```
[ Client Browser ]
      │ (HTTPS)
      ▼
[ Express Server (server.ts) ] ── (Port 3000 Ingress)
      │
      ├──> /api/vacancies & /api/applications (REST API)
      ├──> Google Gemini API (@google/genai - Server-Side Secrets)
      └──> Vite SPA Static / SSR Middleware
      │
[ Firebase Services ]
      ├──> Firebase Authentication (Google OAuth + Email/Password)
      └──> Cloud Firestore (Durable Persistent Storage)
      │
[ External Integrations ]
      └──> Google Sheets API (Workspace OAuth Integration)
```

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons, Recharts Data Visualizations, Motion Animations.
- **Backend**: Node.js + Express (`server.ts`), bundled via `esbuild` to `dist/server.cjs`.
- **Database**: Cloud Firestore (Project `gen-lang-client-0066392058`, Region `asia-southeast1`).
- **Authentication**: Firebase Auth with Google OAuth provider & Workspace scopes.
- **AI Processing**: Google Gemini API via `@google/genai` (Server-side API key proxy).
