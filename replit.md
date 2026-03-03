# SignSafe — Understand Any Contract Before You Sign

## Overview
SignSafe is an AI-powered legal document translator that breaks down contracts, leases, NDAs, and other legal documents into plain English with risk flags, interactive AI follow-up chat, and e-signature capabilities. Originally built for the DigitalOcean Gradient AI Hackathon (as PlainLegal), now rebranded and being developed as a production iOS app with premium features.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: DigitalOcean Gradient AI (OpenAI-compatible API at `https://inference.do-ai.run/v1/`, model: `llama3.3-70b-instruct`)
- **Auth**: Email/password with bcrypt, express-session + connect-pg-simple
- **Routing**: wouter (frontend), Express (backend)
- **PDF Generation**: pdf-lib (for signed document PDFs)
- **Google Drive**: googleapis (via Replit connector)

## Key Files
- `shared/schema.ts` - Data models (users, documents, chat_messages, signatures, signature_requests tables)
- `server/routes.ts` - API endpoints (auth, documents, AI analysis, signatures, Google Drive)
- `server/storage.ts` - Database operations via Drizzle ORM (user, document, signature CRUD)
- `server/googleDrive.ts` - Google Drive integration (list files, download/import)
- `client/src/lib/auth.tsx` - AuthProvider context, useAuth hook, login/register/logout
- `client/src/pages/landing.tsx` - Public marketing landing page (hero, features, CTAs)
- `client/src/pages/auth.tsx` - Login/Register page with tabbed forms
- `client/src/pages/onboarding.tsx` - 6-step animated onboarding for new users
- `client/src/pages/home.tsx` - Main dashboard with file upload, paste, scan, Drive import, samples, history
- `client/src/pages/analysis.tsx` - Analysis view with tabs (Translation, Risks, Terms, Ask AI, Signatures)
- `client/src/pages/sign-request.tsx` - Public signature request page (no auth required)
- `client/src/pages/privacy.tsx` - Privacy Policy page (App Store compliant)
- `client/src/pages/terms.tsx` - Terms of Service page (App Store compliant)
- `client/src/components/signature-pad.tsx` - Signature pad component (draw/type/upload modes)
- `client/src/components/theme-provider.tsx` - Dark mode toggle (ThemeProvider + useTheme)
- `client/src/lib/sample-documents.ts` - 3 pre-built sample legal documents for instant demo
- `client/src/App.tsx` - Route configuration, AuthProvider, protected routes, landing route

## Features
- **Landing Page**: Public marketing page inspired by vemind.click with hero, stats, feature cards, CTAs
- User accounts with email/password authentication
- Animated 6-step onboarding flow for new users (includes AI chat demo)
- Rate limiting: 3 free analyses per month (auto-resets monthly)
- File upload (PDF, TXT, DOC, DOCX) with drag-and-drop support
- Google Drive integration — browse, search, and import documents directly
- Document scanning via camera capture or image upload with OCR (Tesseract.js)
- Paste text directly or use pre-built sample documents
- AI-powered plain English translation of each section
- Risk flags with severity levels (low/medium/high/critical) and suggestions
- Key legal term definitions
- Overall risk meter with visual progress bar
- Interactive AI Q&A chat - ask follow-up questions about your document
- **E-Signatures**: Draw, type, or upload signatures; sign documents; request signatures from others
- **Signed PDF Download**: Generate PDFs with embedded signatures via pdf-lib
- **Public Signature Requests**: Share secure links for others to sign without an account
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

### Google Drive
- `GET /api/drive/files` - List/search Drive files (PDF, DOC, DOCX, TXT, Google Docs)
- `POST /api/drive/import/:fileId` - Import and analyze a Drive file (rate limited)

### Signatures
- `POST /api/signatures` - Save a new signature (auth required)
- `GET /api/signatures` - List user's saved signatures (auth required)
- `DELETE /api/signatures/:id` - Delete a signature (auth required)
- `POST /api/documents/:id/sign` - Sign a document (auth required)
- `POST /api/documents/:id/request-signature` - Send signature request (auth required)
- `GET /api/documents/:id/signatures` - Get signature requests for document (auth required)
- `GET /api/signature-requests` - List all sent signature requests (auth required)
- `GET /api/sign/:token` - View signature request (public, no auth)
- `POST /api/sign/:token` - Sign via token (public, no auth)
- `POST /api/sign/:token/decline` - Decline signature request (public, no auth)

## Dependencies
- `multer` - File upload handling (multipart form data)
- `pdf-parse` - PDF text extraction (loaded via dynamic import)
- `pdf-lib` - PDF generation for signed documents
- `tesseract.js` - OCR text extraction from images (server-side)
- `bcrypt` - Password hashing
- `express-session` + `connect-pg-simple` - Session management with PostgreSQL store
- `googleapis` - Google Drive API integration

## Environment Variables
- `DO_GRADIENT_API_KEY` - DigitalOcean Gradient AI Model Access Key
- `DATABASE_URL` - PostgreSQL connection string (auto-provided)
- `SESSION_SECRET` - Session secret

## Database Tables
- `users` - User accounts (email, password hash, premium status, analyses counter, onboarding flag)
- `documents` - Legal documents (linked to userId or sessionId, with analysis JSON)
- `chat_messages` - AI Q&A chat history per document
- `signatures` - Saved signatures (base64 PNG data, draw/type/upload type)
- `signature_requests` - Signature requests (secure token, status, linked to document)

## Routing
- `/landing` - Public landing page (unauthenticated users redirected here from `/`)
- `/auth` - Login/Register page
- `/onboarding` - New user onboarding flow
- `/` - Home dashboard (protected, requires auth)
- `/analysis/:id` - Document analysis view (protected)
- `/sign/:token` - Public signature request page (no auth required)
- `/privacy` - Privacy Policy
- `/terms` - Terms of Service

## Important Notes
- OpenAI client must be lazy-initialized via `getOpenAI()` factory function
- API key must be a Model Access Key (not a dop_v1_ personal token)
- Schema uses varchar UUIDs for IDs (gen_random_uuid)
- pdf-parse must be dynamically imported
- tesseract.js must be forced external in build config (script/build.ts)
- Passwords are hashed with bcrypt (12 rounds)
- Rate limiting uses DB counter per user, auto-resets monthly
- Protected routes redirect to /landing, new users redirect to /onboarding
- Rebranded from PlainLegal to SignSafe (March 2026)
- Logo icon: ShieldCheck from lucide-react
- Google Drive: Replit connector `connection:conn_google-drive_01KJTVRH07FEBKKT5PNTJ0BBJD`
- Contact email: support@signsafe.app
