# PlainLegal — AI Legal Document Translator

> Built for the **DigitalOcean Gradient AI Hackathon** · Powered by `llama3.3-70b-instruct` via [Gradient AI](https://www.digitalocean.com/products/gradient-ai)

PlainLegal makes legal documents understandable for everyone. Upload any contract, lease, NDA, or employment agreement and instantly get a plain English translation, risk analysis, AI Q&A, and visual PDF signing — all in one place.

---

## Features

### AI-Powered Document Analysis
- **Plain English Translation** — Every clause broken down section-by-section into simple, clear language
- **Risk Detection** — Risky clauses automatically flagged with severity levels (low / medium / high / critical) and actionable suggestions
- **Key Term Definitions** — Legal jargon explained in everyday language
- **Overall Risk Meter** — Animated progress bar showing aggregate document risk at a glance
- **Document Summary** — A 2–3 sentence overview of what the document is and its purpose

### AI Q&A Chat
- Ask follow-up questions about any part of your document
- Answers are grounded in the actual document content and analysis
- Suggested starter questions to help you get going
- Powered by DigitalOcean Gradient AI (Llama 3.3 70B Instruct)

### Visual PDF Signing
- Upload a PDF and see every page rendered in the browser
- Drag and drop your **signature**, **text fields**, and **date stamps** to the exact position on the page
- Zoom in/out and navigate across multi-page documents
- Download the final signed PDF with overlays embedded into the original file

### Document Input
- **File Upload** — Drag-and-drop up to 10 files at once (PDF, TXT, DOC, DOCX, up to 10MB each)
- **Paste Text** — Paste document text directly for instant analysis
- **Sample Documents** — Three pre-built samples (Service Agreement, SaaS Terms of Service, Employment Contract) for instant demo

### Privacy & UX
- **Session Isolation** — Each browser session sees only its own documents, chat history, and signatures
- **Dark Mode** — Full dark/light toggle with localStorage persistence
- **Document History** — Live-polling status tracker (pending → analyzing → complete)
- **Responsive Design** — Works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI Components | shadcn/ui + Tailwind CSS |
| Animations | Framer Motion |
| Routing | wouter |
| Data Fetching | TanStack Query v5 |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Sessions | express-session + connect-pg-simple |
| AI | DigitalOcean Gradient AI (`llama3.3-70b-instruct`) |
| PDF Rendering | pdfjs-dist (client-side) |
| PDF Generation | pdf-lib (server-side), jsPDF (client-side) |
| File Parsing | multer + pdf-parse |
| Build | esbuild (server), Vite (client) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- DigitalOcean Gradient AI Model Access Key

### 1. Clone the repository
```bash
git clone https://github.com/your-username/plainlegal.git
cd plainlegal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set environment variables

Create a `.env` file (or set these in your environment):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/plainlegal
DO_GRADIENT_API_KEY=your_gradient_ai_model_access_key
SESSION_SECRET=your_random_secret_string
```

> **Getting a Gradient AI Key**: Sign up at [cloud.digitalocean.com](https://cloud.digitalocean.com), navigate to **AI & ML → Gradient AI**, and generate a Model Access Key. It must be a **Model Access Key**, not a personal API token.

### 4. Set up the database

Run the following SQL to create the required tables:

```sql
CREATE TABLE documents (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR,
  title TEXT NOT NULL,
  original_text TEXT NOT NULL,
  file_data TEXT,
  file_type TEXT,
  analysis JSONB,
  risk_level TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE chat_messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id VARCHAR NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE signatures (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id VARCHAR NOT NULL,
  session_id VARCHAR,
  signer_name TEXT NOT NULL,
  signature_data TEXT NOT NULL,
  signature_type TEXT NOT NULL DEFAULT 'draw',
  ip_address TEXT,
  signed_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### 5. Run the development server

```bash
npm run dev
```

The app runs on **http://localhost:5000** (Express serves both API and Vite frontend on the same port).

### 6. Build for production

```bash
npm run build
node dist/index.cjs
```

---

## Project Structure

```
plainlegal/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── pages/
│       │   ├── home.tsx        # Homepage: upload, paste, samples, history
│       │   └── analysis.tsx    # Analysis: Translation, Risks, Terms, Chat, Sign
│       ├── components/
│       │   ├── pdf-signer.tsx  # Visual drag-and-drop PDF signing
│       │   ├── signature-pad.tsx # Basic draw/type signature for text docs
│       │   └── theme-provider.tsx
│       └── lib/
│           └── sample-documents.ts  # Pre-built sample docs
├── server/
│   ├── index.ts               # Express app, session config, middleware
│   ├── routes.ts              # All API endpoints + AI integration
│   ├── storage.ts             # Drizzle ORM database layer
│   └── static.ts             # Production static file serving
├── shared/
│   └── schema.ts              # Database schema + Zod types (shared frontend/backend)
└── script/
    └── build.ts               # esbuild production build script
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/documents` | Submit text for analysis |
| `POST` | `/api/documents/upload` | Upload files (multipart, field: `files`) |
| `GET` | `/api/documents` | List documents (session-scoped) |
| `GET` | `/api/documents/:id` | Get document + analysis |
| `DELETE` | `/api/documents/:id` | Delete document (cascades) |
| `GET` | `/api/documents/:id/chat` | Get chat history |
| `POST` | `/api/documents/:id/chat` | Send chat message, get AI reply |
| `GET` | `/api/documents/:id/signatures` | List signatures |
| `POST` | `/api/documents/:id/signatures` | Save a signature |
| `GET` | `/api/documents/:id/pdf` | Serve original PDF bytes |
| `POST` | `/api/documents/:id/generate-signed-pdf` | Embed overlays, return signed PDF |

---

## How the AI Analysis Works

When a document is submitted, the server calls DigitalOcean Gradient AI with a structured prompt requesting JSON output:

```json
{
  "summary": "High-level overview of the document",
  "plainEnglish": [
    { "section": "Section name", "original": "...", "translated": "..." }
  ],
  "riskFlags": [
    { "clause": "...", "severity": "high", "explanation": "...", "suggestion": "..." }
  ],
  "overallRiskLevel": "medium",
  "keyTerms": [
    { "term": "Indemnification", "definition": "..." }
  ],
  "documentType": "Employment Contract"
}
```

Analysis runs asynchronously — the document is created immediately with `status: "pending"`, updated to `"analyzing"` when the AI call starts, and `"complete"` or `"error"` when it finishes. The frontend polls every 2–3 seconds.

---

## Visual PDF Signing — How It Works

1. When a PDF is uploaded, the original bytes are stored as base64 in the database
2. The `GET /api/documents/:id/pdf` endpoint serves these bytes back to the browser
3. `pdfjs-dist` renders each page onto a canvas, which is exported as a PNG data URL
4. The user drags overlays (signature images, text, dates) onto the rendered pages
5. Overlay positions are stored as normalized coordinates (0–1 relative to page dimensions)
6. On download, `pdf-lib` loads the original PDF, converts normalized coordinates back to PDF points, and embeds the overlays at the exact right position on each page

---

## Hackathon Context

PlainLegal was built for the **DigitalOcean Gradient AI Hackathon** with a $20,000 prize pool. The core value proposition: legal documents are intentionally complex, and most people sign contracts without truly understanding what they're agreeing to. PlainLegal fixes that.

**Why Gradient AI?**
- `llama3.3-70b-instruct` has excellent instruction-following for structured JSON output
- The OpenAI-compatible API made integration straightforward
- DigitalOcean's infrastructure provides reliable, low-latency inference

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*PlainLegal is for informational purposes only. It does not provide legal advice. Always consult a qualified attorney for legal matters.*
