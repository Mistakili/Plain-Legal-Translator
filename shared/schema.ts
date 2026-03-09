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
  fileData: text("file_data"),
  fileType: text("file_type"),
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

export const signatures = pgTable("signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  sessionId: varchar("session_id"),
  signerName: text("signer_name").notNull(),
  signatureData: text("signature_data").notNull(),
  signatureType: text("signature_type").notNull().default("draw"),
  ipAddress: text("ip_address"),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
});

export const insertSignatureSchema = createInsertSchema(signatures).omit({
  id: true,
  sessionId: true,
  ipAddress: true,
  signedAt: true,
});

export type Signature = typeof signatures.$inferSelect;
export type InsertSignature = z.infer<typeof insertSignatureSchema>;

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
  fileData: true,
  fileType: true,
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

export const signatures = pgTable("signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  signatureData: text("signature_data").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const signatureRequests = pgTable("signature_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  senderUserId: varchar("sender_user_id").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  recipientName: text("recipient_name").notNull(),
  status: text("status").notNull().default("pending"),
  signatureId: varchar("signature_id"),
  message: text("message"),
  token: varchar("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  signedAt: timestamp("signed_at"),
});

export const insertSignatureSchema = createInsertSchema(signatures).omit({
  id: true,
  createdAt: true,
});

export const insertSignatureRequestSchema = createInsertSchema(signatureRequests).omit({
  id: true,
  createdAt: true,
  signedAt: true,
});

export type InsertSignature = z.infer<typeof insertSignatureSchema>;
export type Signature = typeof signatures.$inferSelect;
export type InsertSignatureRequest = z.infer<typeof insertSignatureRequestSchema>;
export type SignatureRequest = typeof signatureRequests.$inferSelect;
