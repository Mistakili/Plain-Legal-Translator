# PlainLegal — AI Legal Document Translator

## Overview
PlainLegal is an AI-powered legal document translator that breaks down contracts, leases, NDAs, and other legal documents into plain English with risk flags. Built for the DigitalOcean Gradient AI Hackathon.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: DigitalOcean Gradient AI (OpenAI-compatible API at `https://inference.do-ai.run/v1/`)
- **Routing**: wouter (frontend), Express (backend)

## Key Files
- `shared/schema.ts` - Data models (documents table, analysis schema)
- `server/routes.ts` - API endpoints (CRUD documents, AI analysis)
- `server/storage.ts` - Database operations via Drizzle ORM
- `client/src/pages/home.tsx` - Main page with document input and history
- `client/src/pages/analysis.tsx` - Detailed analysis view with tabs
- `client/src/App.tsx` - Route configuration

## API Endpoints
- `POST /api/documents` - Submit document for analysis
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get single document with analysis
- `DELETE /api/documents/:id` - Delete a document

## Environment Variables
- `DO_GRADIENT_API_KEY` - DigitalOcean Gradient AI Model Access Key
- `DATABASE_URL` - PostgreSQL connection string (auto-provided)
- `SESSION_SECRET` - Session secret

## AI Model
Uses `meta-llama/Meta-Llama-3.1-70B-Instruct` via DigitalOcean Gradient AI for legal document analysis. Returns structured JSON with:
- Plain English translations per section
- Risk flags with severity levels
- Key legal term definitions
- Document type classification
- Overall risk assessment
