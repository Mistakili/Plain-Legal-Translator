import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, analysisSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import multer from "multer";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
let PDFParseClass: any = null;
async function getPDFParseClass() {
  if (!PDFParseClass) {
    const mod = await import("pdf-parse");
    PDFParseClass = (mod as any).PDFParse;
  }
  return PDFParseClass;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, TXT, DOC, and DOCX files are supported"));
    }
  },
});

function getOpenAI() {
  return new OpenAI({
    baseURL: "https://inference.do-ai.run/v1/",
    apiKey: process.env.DO_GRADIENT_API_KEY || "",
  });
}

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

const QA_SYSTEM_PROMPT = `You are PlainLegal's AI assistant. You help users understand legal documents by answering their questions in simple, plain English.

You have access to the original legal document text and its AI analysis. Use these to answer questions accurately and helpfully.

Guidelines:
- Use simple, everyday language - avoid legal jargon unless defining it
- Be specific and reference the actual document content when answering
- If the answer isn't in the document, say so clearly
- Always remind users that your answers are informational, not legal advice
- Keep responses concise but thorough
- If asked about risks, reference the specific clauses from the document`;

function stripFileData(doc: any) {
  const { fileData, ...rest } = doc;
  return { ...rest, hasOriginalPdf: !!fileData && doc.fileType === "application/pdf" };
}

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

      const sessionId = req.session.id;
      const doc = await storage.createDocument(parsed.data, sessionId);
      res.json(stripFileData(doc));

      analyzeDocument(doc.id, parsed.data.originalText);
    } catch (err) {
      console.error("Create document error:", err);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  async function extractText(file: Express.Multer.File): Promise<string> {
    if (file.mimetype === "application/pdf") {
      const PDFParse = await getPDFParseClass();
      const parser = new PDFParse({ data: file.buffer });
      const result = await parser.getText();
      return result.text || "";
    }
    return file.buffer.toString("utf-8");
  }

  async function analyzeDocument(docId: string, text: string) {
    try {
      await storage.updateDocument(docId, { status: "analyzing" });
      const client = getOpenAI();
      console.log("Starting AI analysis for document:", docId);

      const completion = await client.chat.completions.create({
        model: "llama3.3-70b-instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Please analyze this legal document:\n\n${text}` },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        await storage.updateDocument(docId, { status: "error" });
        return;
      }

      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const rawAnalysis = JSON.parse(cleaned);
      const validated = analysisSchema.safeParse(rawAnalysis);
      if (!validated.success) {
        console.error("AI output validation failed:", validated.error.message);
        await storage.updateDocument(docId, { status: "error" });
        return;
      }

      await storage.updateDocument(docId, {
        analysis: validated.data,
        riskLevel: validated.data.overallRiskLevel,
        status: "complete",
      });
      console.log("Analysis complete for document:", docId);
    } catch (err) {
      console.error("Analysis error for document:", docId, err);
      await storage.updateDocument(docId, { status: "error" });
    }
  }

  app.post("/api/documents/upload", upload.array("files", 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const sessionId = req.session.id;
      const results: any[] = [];
      const errors: string[] = [];

      for (const file of files) {
        try {
          const extractedText = await extractText(file);
          if (!extractedText.trim()) {
            errors.push(`${file.originalname}: No readable text found`);
            continue;
          }

          const title = file.originalname.replace(/\.[^/.]+$/, "") || "Uploaded Document";
          const fileBase64 = file.mimetype === "application/pdf" ? file.buffer.toString("base64") : null;
          const doc = await storage.createDocument({
            title,
            originalText: extractedText.trim(),
          }, sessionId, fileBase64, file.mimetype);
          results.push(stripFileData(doc));

          analyzeDocument(doc.id, extractedText.trim());
        } catch {
          errors.push(`${file.originalname}: Failed to process file`);
        }
      }

      if (results.length === 0) {
        return res.status(400).json({ error: errors.join("; ") || "Failed to process any files" });
      }

      res.json({ documents: results, errors });
    } catch (err: any) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Failed to process uploaded files" });
    }
  });

  app.get("/api/documents", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const docs = await storage.getDocuments(sessionId);
      res.json(docs.map(stripFileData));
    } catch (err) {
      console.error("Get documents error:", err);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const doc = await storage.getDocument(req.params.id, sessionId);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(stripFileData(doc));
    } catch (err) {
      console.error("Get document error:", err);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const sessionId = req.session.id;
      await storage.deleteDocument(req.params.id, sessionId);
      res.json({ success: true });
    } catch (err) {
      console.error("Delete document error:", err);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  app.get("/api/documents/:id/chat", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.id);
      res.json(messages);
    } catch (err) {
      console.error("Get chat messages error:", err);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/documents/:id/chat", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const doc = await storage.getDocument(req.params.id, sessionId);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }

      const { content } = req.body;
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ error: "Message content is required" });
      }
      if (content.length > 2000) {
        return res.status(400).json({ error: "Message is too long. Please keep it under 2000 characters." });
      }

      await storage.createChatMessage({
        documentId: doc.id,
        role: "user",
        content: content.trim(),
      });

      const chatHistory = await storage.getChatMessages(doc.id);
      const recentHistory = chatHistory.slice(-20);

      const analysisContext = doc.analysis
        ? `\n\nDocument Analysis Summary:\n${JSON.stringify(doc.analysis, null, 2).slice(0, 3000)}`
        : "";

      const docText = doc.originalText.length > 6000
        ? doc.originalText.slice(0, 6000) + "\n...[document truncated for context length]"
        : doc.originalText;

      const client = getOpenAI();
      const completion = await client.chat.completions.create({
        model: "llama3.3-70b-instruct",
        messages: [
          {
            role: "system",
            content: `${QA_SYSTEM_PROMPT}\n\nOriginal Document:\n${docText}${analysisContext}`,
          },
          ...recentHistory.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        ],
        temperature: 0.4,
        max_tokens: 1024,
      });

      const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

      const assistantMsg = await storage.createChatMessage({
        documentId: doc.id,
        role: "assistant",
        content: aiResponse,
      });

      res.json(assistantMsg);
    } catch (err) {
      console.error("Chat error:", err);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  app.get("/api/documents/:id/signatures", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const doc = await storage.getDocument(req.params.id, sessionId);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      const sigs = await storage.getSignatures(req.params.id, sessionId);
      res.json(sigs);
    } catch (err) {
      console.error("Get signatures error:", err);
      res.status(500).json({ error: "Failed to fetch signatures" });
    }
  });

  app.post("/api/documents/:id/signatures", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const doc = await storage.getDocument(req.params.id, sessionId);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }

      const { signerName, signatureData, signatureType, documentId } = req.body;
      if (!signerName || typeof signerName !== "string" || signerName.trim().length === 0) {
        return res.status(400).json({ error: "Signer name is required" });
      }
      if (!signatureData || typeof signatureData !== "string" || signatureData.trim().length === 0) {
        return res.status(400).json({ error: "Signature data is required" });
      }
      if (signatureType === "draw" && !signatureData.startsWith("data:image/png")) {
        return res.status(400).json({ error: "Invalid signature image format" });
      }
      if (signatureType === "type" && signatureData.length > 200) {
        return res.status(400).json({ error: "Typed signature is too long" });
      }
      if (signatureData.length > 500000) {
        return res.status(400).json({ error: "Signature data is too large" });
      }
      if (signatureType !== "draw" && signatureType !== "type") {
        return res.status(400).json({ error: "Signature type must be 'draw' or 'type'" });
      }

      const ipAddress = req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "unknown";

      const sig = await storage.createSignature({
        documentId: req.params.id,
        signerName: signerName.trim(),
        signatureData: signatureData.trim(),
        signatureType,
      }, sessionId, ipAddress);

      res.json(sig);
    } catch (err) {
      console.error("Create signature error:", err);
      res.status(500).json({ error: "Failed to save signature" });
    }
  });

  app.get("/api/documents/:id/pdf", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const doc = await storage.getDocument(req.params.id, sessionId);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      if (!doc.fileData || doc.fileType !== "application/pdf") {
        return res.status(404).json({ error: "No original PDF available" });
      }
      const pdfBuffer = Buffer.from(doc.fileData, "base64");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("Get PDF error:", err);
      res.status(500).json({ error: "Failed to fetch PDF" });
    }
  });

  app.post("/api/documents/:id/generate-signed-pdf", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const doc = await storage.getDocument(req.params.id, sessionId);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      if (!doc.fileData || doc.fileType !== "application/pdf") {
        return res.status(404).json({ error: "No original PDF available" });
      }

      const overlaySchema = z.object({
        overlays: z.array(z.object({
          type: z.enum(["signature", "text", "date"]),
          page: z.number().int().min(0),
          x: z.number().min(0).max(1),
          y: z.number().min(0).max(1),
          width: z.number().min(0.01).max(1),
          height: z.number().min(0.005).max(1),
          value: z.string().min(1).max(500000),
          fontSize: z.number().min(6).max(72).optional(),
        })).min(1).max(50),
      });

      const parsed = overlaySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid overlay data", details: parsed.error.message });
      }
      const { overlays } = parsed.data;

      const pdfBuffer = Buffer.from(doc.fileData, "base64");
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

      for (const overlay of overlays) {
        if (overlay.page < 0 || overlay.page >= pages.length) continue;
        const page = pages[overlay.page];
        const { width: pw, height: ph } = page.getSize();

        const pdfX = overlay.x * pw;
        const pdfY = ph - (overlay.y * ph) - (overlay.height * ph);

        if (overlay.type === "signature" && overlay.value.startsWith("data:image")) {
          try {
            const base64Data = overlay.value.split(",")[1];
            const imgBytes = Buffer.from(base64Data, "base64");
            const pngImage = await pdfDoc.embedPng(imgBytes);
            const drawW = overlay.width * pw;
            const drawH = overlay.height * ph;
            page.drawImage(pngImage, {
              x: pdfX,
              y: pdfY,
              width: drawW,
              height: drawH,
            });
          } catch (imgErr) {
            console.error("Failed to embed signature image:", imgErr);
          }
        } else if (overlay.type === "signature") {
          const fontSize = Math.min(overlay.height * ph * 0.6, 28);
          page.drawText(overlay.value, {
            x: pdfX,
            y: pdfY + (overlay.height * ph * 0.2),
            size: fontSize,
            font: italicFont,
            color: rgb(0, 0, 0),
          });
        } else if (overlay.type === "text" || overlay.type === "date") {
          const fontSize = overlay.fontSize || 12;
          page.drawText(overlay.value, {
            x: pdfX,
            y: pdfY + (overlay.height * ph * 0.3),
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const safeTitle = doc.title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}-signed.pdf"`);
      res.setHeader("Content-Length", pdfBytes.length);
      res.send(Buffer.from(pdfBytes));
    } catch (err) {
      console.error("Generate signed PDF error:", err);
      res.status(500).json({ error: "Failed to generate signed PDF" });
    }
  });

  return httpServer;
}
