import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  isPremium: boolean("is_premium").notNull().default(false),
  analysesUsedThisMonth: integer("analyses_used_this_month").notNull().default(0),
  analysesResetDate: timestamp("analyses_reset_date").defaultNow().notNull(),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id"),
  userId: varchar("user_id"),
  title: text("title").notNull(),
  originalText: text("original_text").notNull(),
  analysis: jsonb("analysis"),
  riskLevel: text("risk_level"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isPremium: true,
  analysesUsedThisMonth: true,
  analysesResetDate: true,
  onboardingCompleted: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  sessionId: true,
  userId: true,
  createdAt: true,
  analysis: true,
  riskLevel: true,
  status: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type Analysis = z.infer<typeof analysisSchema>;
export type RiskFlag = z.infer<typeof riskFlagSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
