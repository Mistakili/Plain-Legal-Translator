import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://inference.do-ai.run/v1/",
  apiKey: process.env.DO_GRADIENT_API_KEY,
});

const SYSTEM_PROMPT = `You are PlainLegal, an expert legal document analyzer. Your job is to:
1. Translate legal language into plain, everyday English that anyone can understand
2. Identify and flag potential risks, unfavorable terms, or clauses that need attention
3. Define key legal terms used in the document
4. Determine the type of document (lease, NDA, employment contract, etc.)

You MUST respond with valid JSON matching this exact structure:
{
  "summary": "A 2-3 sentence high-level summary of what this document is about and its purpose",
  "plainEnglish": [
    {
      "section": "Section name or heading",
      "original": "The exact original legal text of this section",
      "translated": "The plain English translation of what this section means"
    }
  ],
  "riskFlags": [
    {
      "clause": "The specific clause or section that poses a risk",
      "severity": "low|medium|high|critical",
      "explanation": "Why this is a risk in plain English",
      "suggestion": "What the reader should consider doing about it"
    }
  ],
  "overallRiskLevel": "low|medium|high|critical",
  "keyTerms": [
    {
      "term": "Legal term used in the document",
      "definition": "Simple definition of what this term means"
    }
  ],
  "documentType": "The type of legal document (e.g., Non-Disclosure Agreement, Lease Agreement, Employment Contract)"
}

Guidelines:
- Break the document into logical sections
- Use simple, conversational language in translations
- Be thorough in identifying risks - err on the side of flagging more
- Severity levels: low = minor concern, medium = should be aware, high = potentially problematic, critical = requires immediate attention
- Include at least 3-5 key terms from the document
- Be specific in risk explanations and suggestions
- ONLY output valid JSON, no markdown, no extra text`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/documents", async (req, res) => {
    try {
      const parsed = insertDocumentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }

      const doc = await storage.createDocument(parsed.data);

      res.json(doc);

      try {
        await storage.updateDocument(doc.id, { status: "analyzing" });

        const completion = await openai.chat.completions.create({
          model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Please analyze this legal document:\n\n${parsed.data.originalText}` },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          await storage.updateDocument(doc.id, { status: "error" });
          return;
        }

        let analysis;
        try {
          const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          analysis = JSON.parse(cleaned);
        } catch {
          await storage.updateDocument(doc.id, { status: "error" });
          return;
        }

        await storage.updateDocument(doc.id, {
          analysis,
          riskLevel: analysis.overallRiskLevel,
          status: "complete",
        });
      } catch (err) {
        console.error("Analysis error:", err);
        await storage.updateDocument(doc.id, { status: "error" });
      }
    } catch (err) {
      console.error("Create document error:", err);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.get("/api/documents", async (_req, res) => {
    try {
      const docs = await storage.getDocuments();
      res.json(docs);
    } catch (err) {
      console.error("Get documents error:", err);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const doc = await storage.getDocument(req.params.id);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(doc);
    } catch (err) {
      console.error("Get document error:", err);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      await storage.deleteDocument(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error("Delete document error:", err);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  return httpServer;
}
