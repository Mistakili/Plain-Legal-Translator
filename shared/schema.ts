import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  originalText: text("original_text").notNull(),
  analysis: jsonb("analysis"),
  riskLevel: text("risk_level"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const riskFlagSchema = z.object({
  clause: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  explanation: z.string(),
  suggestion: z.string(),
});

export const analysisSchema = z.object({
  summary: z.string(),
  plainEnglish: z.array(z.object({
    section: z.string(),
    original: z.string(),
    translated: z.string(),
  })),
  riskFlags: z.array(riskFlagSchema),
  overallRiskLevel: z.enum(["low", "medium", "high", "critical"]),
  keyTerms: z.array(z.object({
    term: z.string(),
    definition: z.string(),
  })),
  documentType: z.string(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  analysis: true,
  riskLevel: true,
  status: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type Analysis = z.infer<typeof analysisSchema>;
export type RiskFlag = z.infer<typeof riskFlagSchema>;
