# PlainLegal — AI Legal Document Translator

## Overview
PlainLegal is an AI-powered legal document translator that breaks down contracts, leases, NDAs, and other legal documents into plain English with risk flags. Originally built for the DigitalOcean Gradient AI Hackathon, now being developed as a production iOS app with premium features.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: DigitalOcean Gradient AI (OpenAI-compatible API at `https://inference.do-ai.run/v1/`, model: `llama3.3-70b-instruct`)
- **Auth**: Email/password with bcrypt, express-session + connect-pg-simple
- **Routing**: wouter (frontend), Express (backend)

## Key Files
- `shared/schema.ts` - Data models (users, documents, chat_messages tables, analysis schema)
- `server/routes.ts` - API endpoints (auth, CRUD documents, AI analysis, file upload, Q&A chat)
- `server/storage.ts` - Database operations via Drizzle ORM (user + document CRUD)
- `client/src/lib/auth.tsx` - AuthProvider context, useAuth hook, login/register/logout
- `client/src/pages/auth.tsx` - Login/Register page with tabbed forms
- `client/src/pages/onboarding.tsx` - 5-step animated onboarding for new users
- `client/src/pages/home.tsx` - Main page with file upload, paste text, scan, sample documents, and history
- `client/src/pages/analysis.tsx` - Analysis view with tabs (Translation, Risks, Terms, Ask AI)
- `client/src/pages/privacy.tsx` - Privacy Policy page (App Store compliant)
- `client/src/pages/terms.tsx` - Terms of Service page (App Store compliant)
- `client/src/components/theme-provider.tsx` - Dark mode toggle (ThemeProvider + useTheme)
- `client/src/lib/sample-documents.ts` - 3 pre-built sample legal documents for instant demo
- `client/src/App.tsx` - Route configuration, AuthProvider, protected routes

## Features
- User accounts with email/password authentication
- Animated 5-step onboarding flow for new users
- Rate limiting: 3 free analyses per month (auto-resets monthly)
- File upload (PDF, TXT, DOC, DOCX) with drag-and-drop support
- Document scanning via camera capture or image upload with OCR text extraction (Tesseract.js)
- Paste text directly or use pre-built sample documents
- AI-powered plain English translation of each section
- Risk flags with severity levels (low/medium/high/critical) and suggestions
- Key legal term definitions
- Overall risk meter with visual progress bar
- Interactive AI Q&A chat - ask follow-up questions about your document
- Dark mode toggle with localStorage persistence
- Document history with status tracking
- Privacy Policy and Terms of Service pages (App Store compliant)
- Account deletion (App Store requirement)
- Framer Motion animations throughout

## API Endpoints
### Auth
- `POST /api/auth/register` - Create account (email, password, displayName)
- `POST /api/auth/login` - Sign in (email, password)
- `POST /api/auth/logout` - Sign out (destroys session)
- `GET /api/auth/user` - Get current user or null
- `PATCH /api/auth/user` - Update user (displayName, onboardingCompleted)
- `DELETE /api/auth/account` - Delete account and all data

### Documents
- `POST /api/documents` - Submit document text for analysis (rate limited)
- `POST /api/documents/upload` - Upload files for analysis (rate limited)
- `POST /api/documents/scan` - Upload images for OCR + analysis (rate limited)
- `GET /api/documents` - List all documents (scoped to user)
- `GET /api/documents/:id` - Get single document with analysis
- `DELETE /api/documents/:id` - Delete a document
- `GET /api/documents/:id/chat` - Get chat messages for a document
- `POST /api/documents/:id/chat` - Send a chat message and get AI response

## Dependencies
- `multer` - File upload handling (multipart form data)
- `pdf-parse` - PDF text extraction (loaded via dynamic import)
- `tesseract.js` - OCR text extraction from images (server-side, for document scanning)
- `bcrypt` - Password hashing
- `express-session` + `connect-pg-simple` - Session management with PostgreSQL store

## Environment Variables
- `DO_GRADIENT_API_KEY` - DigitalOcean Gradient AI Model Access Key
- `DATABASE_URL` - PostgreSQL connection string (auto-provided)
- `SESSION_SECRET` - Session secret

## AI Model
Uses `llama3.3-70b-instruct` via DigitalOcean Gradient AI for:
1. Legal document analysis - structured JSON with translations, risk flags, key terms
2. Interactive Q&A - conversational follow-up questions about analyzed documents

## Database Tables
- `users` - User accounts (email, password hash, premium status, analyses counter, onboarding flag)
- `documents` - Legal documents (linked to userId or sessionId, with analysis JSON)
- `chat_messages` - AI Q&A chat history per document

## Important Notes
- OpenAI client must be lazy-initialized via `getOpenAI()` factory function
- API key must be a Model Access Key (not a dop_v1_ personal token)
- Schema uses varchar UUIDs for IDs (gen_random_uuid)
- pdf-parse must be dynamically imported
- tesseract.js must be forced external in build config (script/build.ts)
- Passwords are hashed with bcrypt (12 rounds)
- Rate limiting uses DB counter per user, auto-resets monthly
- Protected routes redirect to /auth, new users redirect to /onboarding
