# PlainLegal — AI Legal Document Translator

## Overview
PlainLegal is an AI-powered legal document translator built for the DigitalOcean Gradient AI Hackathon. It breaks down contracts, leases, NDAs, employment agreements, and any other legal document into plain English — with risk analysis, AI Q&A, and visual PDF signing.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM (session-scoped isolation)
- **AI**: DigitalOcean Gradient AI (OpenAI-compatible API at `https://inference.do-ai.run/v1/`, model: `llama3.3-70b-instruct`)
- **Routing**: wouter (frontend), Express (backend)
- **Sessions**: express-session + connect-pg-simple (cookie-based, 30-day TTL)

## Key Files
- `shared/schema.ts` - Data models: documents, chat_messages, signatures tables + Zod schemas
- `server/routes.ts` - All API endpoints: document CRUD, AI analysis, file upload, Q&A chat, PDF serving, signed PDF generation
- `server/storage.ts` - Database operations via Drizzle ORM
- `server/index.ts` - Express server setup, session middleware, request logging
- `client/src/pages/home.tsx` - Homepage: upload, paste, sample docs, feature showcase, document history
- `client/src/pages/analysis.tsx` - Analysis view: Translation, Risks, Terms, Ask AI, Sign tabs
- `client/src/components/pdf-signer.tsx` - Visual PDF signing: pdfjs-dist page rendering, drag-and-drop overlays
- `client/src/components/signature-pad.tsx` - Basic signature panel for pasted text documents
- `client/src/components/theme-provider.tsx` - Dark mode toggle (ThemeProvider + useTheme hook)
- `client/src/lib/sample-documents.ts` - 3 pre-built sample legal documents for instant demo
- `client/src/App.tsx` - Route configuration + ThemeProvider wrapper

## Features
- **Plain English Translation** — Every clause translated section-by-section into simple language
- **Risk Detection** — Risky clauses flagged with severity levels (low/medium/high/critical) and actionable suggestions
- **Key Term Definitions** — Important legal terms explained in plain language
- **Overall Risk Meter** — Animated progress bar showing aggregate document risk
- **AI Q&A Chat** — Ask follow-up questions about any part of your document (context-aware)
- **Visual PDF Signing** — Render PDF pages, drag-and-drop signature/text/date overlays to exact position, download signed PDF
- **Basic Signature** — Draw or type signature for pasted-text documents; downloadable PDF confirmation
- **Multi-Format Upload** — Drag-and-drop up to 10 files (PDF, TXT, DOC, DOCX), batch processing
- **Paste Text** — Submit document text directly for analysis
- **Sample Documents** — 3 pre-built samples (NDA, SaaS ToS, Employment Contract) for instant demo
- **Session Isolation** — Each browser session sees only its own documents, chat, and signatures
- **Dark Mode** — Full dark/light toggle with localStorage persistence
- **Document History** — Status tracking (pending → analyzing → complete/error) with live polling

## API Endpoints
- `POST /api/documents` — Submit document text for analysis
- `POST /api/documents/upload` — Upload files (multipart, field: "files", up to 10)
- `GET /api/documents` — List all documents (session-scoped, strips fileData)
- `GET /api/documents/:id` — Get single document with full analysis (session-scoped)
- `DELETE /api/documents/:id` — Delete document (cascades to chat messages + signatures)
- `GET /api/documents/:id/chat` — Get chat message history
- `POST /api/documents/:id/chat` — Send message, get AI response
- `GET /api/documents/:id/signatures` — List signatures (session-scoped)
- `POST /api/documents/:id/signatures` — Save a signature
- `GET /api/documents/:id/pdf` — Serve original PDF bytes for visual rendering
- `POST /api/documents/:id/generate-signed-pdf` — Embed overlays into PDF and return signed file

## Dependencies
- `multer` — Multipart file upload handling
- `pdf-parse` — PDF text extraction (dynamic import due to CJS/ESM compat)
- `pdf-lib` — Server-side PDF manipulation (embed signature overlays)
- `pdfjs-dist` — Client-side PDF page rendering (visual signing UI)
- `jspdf` — Client-side PDF generation (basic signature download)
- `express-session` + `connect-pg-simple` — Session management backed by PostgreSQL

## Environment Variables
- `DO_GRADIENT_API_KEY` — DigitalOcean Gradient AI Model Access Key
- `DATABASE_URL` — PostgreSQL connection string (auto-provided by Replit)
- `SESSION_SECRET` — Session signing secret

## AI Model
Uses `llama3.3-70b-instruct` via DigitalOcean Gradient AI for:
1. **Document analysis** — Returns structured JSON: summary, section-by-section plain English translations, risk flags with severity + suggestions, key term definitions, document type, overall risk level
2. **Interactive Q&A** — Conversational answers grounded in the document content and analysis

## Important Technical Notes
- OpenAI client lazy-initialized via `getOpenAI()` factory to avoid cold-start issues
- API key must be a Gradient AI Model Access Key (not a `dop_v1_` personal token)
- Schema uses `varchar` UUIDs via `gen_random_uuid()` for all primary keys
- `pdf-parse` loaded via dynamic `import()` and marked external in esbuild to avoid CJS issues
- `pdf-lib` is in the esbuild allowlist (not external) so it bundles correctly
- `stripFileData()` helper strips base64 PDF payload from all document list/get responses, returning only a `hasOriginalPdf` boolean flag
- Overlay coordinates in PDF signing are normalized (0–1 range) relative to page dimensions
- Build: esbuild → `dist/index.cjs` via `script/build.ts`
