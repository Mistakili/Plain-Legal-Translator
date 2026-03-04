import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, analysisSchema, insertChatMessageSchema } from "@shared/schema";
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
      const { fileData: _fd, ...docWithout } = doc;
      res.json({ ...docWithout, hasOriginalPdf: false });

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
          const { fileData: _fd, ...docWithout } = doc;
          results.push({ ...docWithout, hasOriginalPdf: !!fileBase64 });

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
      res.json(docs.map(({ fileData, ...rest }) => ({ ...rest, hasOriginalPdf: !!fileData && rest.fileType === "application/pdf" })));
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
      const { fileData, ...rest } = doc;
      res.json({ ...rest, hasOriginalPdf: !!fileData && doc.fileType === "application/pdf" });
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

  app.get("/api/documents/:id/download-signed", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const doc = await storage.getDocument(req.params.id, sessionId);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }

      const signatureId = req.query.signatureId as string;
      if (!signatureId) {
        return res.status(400).json({ error: "signatureId query parameter is required" });
      }

      const sigs = await storage.getSignatures(req.params.id, sessionId);
      const sig = sigs.find(s => s.id === signatureId);
      if (!sig) {
        return res.status(404).json({ error: "Signature not found" });
      }

      let pdfDoc: InstanceType<typeof PDFDocument>;

      if (doc.fileData && doc.fileType === "application/pdf") {
        const pdfBuffer = Buffer.from(doc.fileData, "base64");
        pdfDoc = await PDFDocument.load(pdfBuffer);
      } else {
        pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pageWidth = 595;
        const pageHeight = 842;
        const margin = 50;
        const lineHeight = 14;
        const fontSize = 10;
        const contentWidth = pageWidth - margin * 2;

        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

        const titleSize = 16;
        page.drawText(doc.title, {
          x: margin,
          y: y,
          size: titleSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        y -= titleSize + 10;

        page.drawLine({
          start: { x: margin, y },
          end: { x: pageWidth - margin, y },
          thickness: 0.5,
          color: rgb(0.7, 0.7, 0.7),
        });
        y -= 20;

        const lines = doc.originalText.split("\n");
        for (const rawLine of lines) {
          const words = rawLine.split(/\s+/);
          let currentLine = "";
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = font.widthOfTextAtSize(testLine, fontSize);
            if (textWidth > contentWidth && currentLine) {
              if (y < margin + 20) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                y = pageHeight - margin;
              }
              page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
              y -= lineHeight;
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) {
            if (y < margin + 20) {
              page = pdfDoc.addPage([pageWidth, pageHeight]);
              y = pageHeight - margin;
            }
            page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
            y -= lineHeight;
          } else {
            y -= lineHeight * 0.5;
          }
        }
      }

      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width: pw, height: ph } = lastPage.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let sigY = 120;
      if (sigY > ph - 50) {
        sigY = ph - 100;
      }

      let targetPage = lastPage;
      if (sigY < 50) {
        targetPage = pdfDoc.addPage([pw, ph]);
        sigY = ph - 100;
      }

      targetPage.drawLine({
        start: { x: 50, y: sigY + 60 },
        end: { x: pw - 50, y: sigY + 60 },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });

      targetPage.drawText("SIGNED BY:", {
        x: 50,
        y: sigY + 45,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      targetPage.drawText(`Name: ${sig.signerName}`, {
        x: 50,
        y: sigY + 30,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });

      targetPage.drawText(`Date: ${new Date(sig.signedAt).toLocaleDateString()}`, {
        x: 50,
        y: sigY + 16,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });

      if (sig.signatureType === "draw" && sig.signatureData.startsWith("data:image")) {
        try {
          const base64Data = sig.signatureData.split(",")[1];
          const imgBytes = Buffer.from(base64Data, "base64");
          const pngImage = await pdfDoc.embedPng(imgBytes);
          const imgDims = pngImage.scale(0.3);
          const maxW = 180;
          const maxH = 60;
          let drawW = imgDims.width;
          let drawH = imgDims.height;
          if (drawW > maxW) { drawH = drawH * (maxW / drawW); drawW = maxW; }
          if (drawH > maxH) { drawW = drawW * (maxH / drawH); drawH = maxH; }

          targetPage.drawText("Signature:", {
            x: 50,
            y: sigY + 2,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
          targetPage.drawImage(pngImage, {
            x: 50,
            y: sigY - drawH - 5,
            width: drawW,
            height: drawH,
          });
        } catch (imgErr) {
          console.error("Failed to embed signature image:", imgErr);
          targetPage.drawText(`Signature: [digital signature]`, {
            x: 50,
            y: sigY + 2,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }
      } else if (sig.signatureType === "type") {
        targetPage.drawText("Signature:", {
          x: 50,
          y: sigY + 2,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
        targetPage.drawText(sig.signatureData, {
          x: 120,
          y: sigY,
          size: 22,
          font: italicFont,
          color: rgb(0, 0, 0),
        });
        targetPage.drawLine({
          start: { x: 120, y: sigY - 3 },
          end: { x: 300, y: sigY - 3 },
          thickness: 0.5,
          color: rgb(0.3, 0.3, 0.3),
        });
      }

      targetPage.drawText("Electronically signed using PlainLegal", {
        x: 50,
        y: sigY - 75,
        size: 7,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });

      const pdfBytes = await pdfDoc.save();
      const safeTitle = doc.title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}-signed.pdf"`);
      res.setHeader("Content-Length", pdfBytes.length);
      res.send(Buffer.from(pdfBytes));
    } catch (err) {
      console.error("Download signed PDF error:", err);
      res.status(500).json({ error: "Failed to generate signed PDF" });
    }
  });

  return httpServer;
}
