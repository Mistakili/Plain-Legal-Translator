# PlainLegal — AI Legal Document Translator

## Overview
PlainLegal is an AI-powered legal document translator that breaks down contracts, leases, NDAs, and other legal documents into plain English with risk flags. Built for the DigitalOcean Gradient AI Hackathon.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: DigitalOcean Gradient AI (OpenAI-compatible API at `https://inference.do-ai.run/v1/`, model: `llama3.3-70b-instruct`)
- **Routing**: wouter (frontend), Express (backend)

## Key Files
- `shared/schema.ts` - Data models (documents + chat_messages tables, analysis schema)
- `server/routes.ts` - API endpoints (CRUD documents, AI analysis, file upload, Q&A chat)
- `server/storage.ts` - Database operations via Drizzle ORM
- `client/src/pages/home.tsx` - Main page with file upload, paste text, sample documents, and history
- `client/src/pages/analysis.tsx` - Analysis view with tabs (Translation, Risks, Terms, Ask AI)
- `client/src/components/theme-provider.tsx` - Dark mode toggle (ThemeProvider + useTheme)
- `client/src/lib/sample-documents.ts` - 3 pre-built sample legal documents for instant demo
- `client/src/App.tsx` - Route configuration + ThemeProvider wrapper

## Features
- File upload (PDF, TXT, DOC, DOCX) with drag-and-drop support (multi-file, up to 10)
- Paste text directly or use pre-built sample documents
- AI-powered plain English translation of each section
- Risk flags with severity levels (low/medium/high/critical) and suggestions
- Key legal term definitions
- Overall risk meter with visual progress bar
- Interactive AI Q&A chat - ask follow-up questions about your document
- Document signing - draw or type your signature, with downloadable confirmation
- Session-based document isolation (each browser sees only their own documents)
- Dark mode toggle with localStorage persistence
- Document history with status tracking
- Framer Motion animations throughout

## API Endpoints
- `POST /api/documents` - Submit document text for analysis
- `POST /api/documents/upload` - Upload files (PDF/TXT/DOC/DOCX) for analysis (multipart form, field: "files", up to 10)
- `GET /api/documents` - List all documents (session-scoped)
- `GET /api/documents/:id` - Get single document with analysis (session-scoped)
- `DELETE /api/documents/:id` - Delete a document (cascades to chat messages + signatures)
- `GET /api/documents/:id/chat` - Get chat messages for a document
- `POST /api/documents/:id/chat` - Send a chat message and get AI response
- `GET /api/documents/:id/signatures` - Get signatures for a document (session-scoped)
- `POST /api/documents/:id/signatures` - Sign a document (draw or typed signature)

## Dependencies
- `multer` - File upload handling (multipart form data)
- `pdf-parse` - PDF text extraction (loaded via createRequire for ESM compat)

## Environment Variables
- `DO_GRADIENT_API_KEY` - DigitalOcean Gradient AI Model Access Key
- `DATABASE_URL` - PostgreSQL connection string (auto-provided)
- `SESSION_SECRET` - Session secret

## AI Model
Uses `llama3.3-70b-instruct` via DigitalOcean Gradient AI for:
1. Legal document analysis - structured JSON with translations, risk flags, key terms
2. Interactive Q&A - conversational follow-up questions about analyzed documents

## Important Notes
- OpenAI client must be lazy-initialized via `getOpenAI()` factory function
- API key must be a Model Access Key (not a dop_v1_ personal token)
- Schema uses varchar UUIDs for IDs (gen_random_uuid)
- pdf-parse must be imported via `createRequire` due to ESM compatibility issues
