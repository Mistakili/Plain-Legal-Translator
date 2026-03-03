import { type Document, type InsertDocument, type ChatMessage, type InsertChatMessage, type User, type InsertUser, type Signature, type InsertSignature, type SignatureRequest, type InsertSignatureRequest, documents, chatMessages, users, signatures, signatureRequests } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcrypt";

export interface IStorage {
  createUser(data: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  checkAndResetMonthlyAnalyses(userId: string): Promise<User>;
  incrementAnalysesUsed(userId: string): Promise<void>;
  createDocument(doc: InsertDocument, sessionId: string, userId?: string): Promise<Document>;
  getDocument(id: string, sessionId: string, userId?: string): Promise<Document | undefined>;
  updateDocument(id: string, data: Partial<Document>): Promise<Document | undefined>;
  getDocuments(sessionId: string, userId?: string): Promise<Document[]>;
  deleteDocument(id: string, sessionId: string, userId?: string): Promise<void>;
  createChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(documentId: string): Promise<ChatMessage[]>;
  getDocumentById(id: string): Promise<Document | undefined>;
  createSignature(data: InsertSignature): Promise<Signature>;
  getSignaturesByUser(userId: string): Promise<Signature[]>;
  getSignatureById(id: string): Promise<Signature | undefined>;
  deleteSignature(id: string): Promise<void>;
  createSignatureRequest(data: InsertSignatureRequest): Promise<SignatureRequest>;
  getSignatureRequestsByDocument(documentId: string): Promise<SignatureRequest[]>;
  getSignatureRequestByToken(token: string): Promise<SignatureRequest | undefined>;
  updateSignatureRequest(id: string, data: Partial<SignatureRequest>): Promise<SignatureRequest | undefined>;
  getSignatureRequestsByUser(userId: string): Promise<SignatureRequest[]>;
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export class DatabaseStorage implements IStorage {
  async createUser(data: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const [result] = await db.insert(users).values({
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      displayName: data.displayName || null,
    }).returning();
    return result;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    return result;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [result] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result;
  }

  async deleteUser(id: string): Promise<void> {
    const userDocs = await db.select().from(documents).where(eq(documents.userId, id));
    for (const doc of userDocs) {
      await db.delete(chatMessages).where(eq(chatMessages.documentId, doc.id));
    }
    await db.delete(documents).where(eq(documents.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async checkAndResetMonthlyAnalyses(userId: string): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error("User not found");

    const now = new Date();
    const resetDate = new Date(user.analysesResetDate);
    if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
      const [updated] = await db.update(users).set({
        analysesUsedThisMonth: 0,
        analysesResetDate: now,
      }).where(eq(users.id, userId)).returning();
      return updated;
    }
    return user;
  }

  async incrementAnalysesUsed(userId: string): Promise<void> {
    const user = await this.checkAndResetMonthlyAnalyses(userId);
    await db.update(users).set({
      analysesUsedThisMonth: user.analysesUsedThisMonth + 1,
    }).where(eq(users.id, userId));
  }

  async createDocument(doc: InsertDocument, sessionId: string, userId?: string): Promise<Document> {
    const [result] = await db.insert(documents).values({ ...doc, sessionId, userId: userId || null }).returning();
    return result;
  }

  async getDocument(id: string, sessionId: string, userId?: string): Promise<Document | undefined> {
    if (userId) {
      const [result] = await db.select().from(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));
      return result;
    }
    const [result] = await db.select().from(documents).where(and(eq(documents.id, id), eq(documents.sessionId, sessionId)));
    return result;
  }

  async updateDocument(id: string, data: Partial<Document>): Promise<Document | undefined> {
    const [result] = await db.update(documents).set(data).where(eq(documents.id, id)).returning();
    return result;
  }

  async getDocuments(sessionId: string, userId?: string): Promise<Document[]> {
    if (userId) {
      return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));
    }
    return db.select().from(documents).where(eq(documents.sessionId, sessionId)).orderBy(desc(documents.createdAt));
  }

  async deleteDocument(id: string, sessionId: string, userId?: string): Promise<void> {
    const doc = await this.getDocument(id, sessionId, userId);
    if (!doc) return;
    await db.delete(chatMessages).where(eq(chatMessages.documentId, id));
    await db.delete(documents).where(eq(documents.id, id));
  }

  async createChatMessage(msg: InsertChatMessage): Promise<ChatMessage> {
    const [result] = await db.insert(chatMessages).values(msg).returning();
    return result;
  }

  async getChatMessages(documentId: string): Promise<ChatMessage[]> {
    return db.select().from(chatMessages).where(eq(chatMessages.documentId, documentId)).orderBy(chatMessages.createdAt);
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    const [result] = await db.select().from(documents).where(eq(documents.id, id));
    return result;
  }

  async createSignature(data: InsertSignature): Promise<Signature> {
    const [result] = await db.insert(signatures).values(data).returning();
    return result;
  }

  async getSignaturesByUser(userId: string): Promise<Signature[]> {
    return db.select().from(signatures).where(eq(signatures.userId, userId)).orderBy(desc(signatures.createdAt));
  }

  async getSignatureById(id: string): Promise<Signature | undefined> {
    const [result] = await db.select().from(signatures).where(eq(signatures.id, id));
    return result;
  }

  async deleteSignature(id: string): Promise<void> {
    await db.delete(signatures).where(eq(signatures.id, id));
  }

  async createSignatureRequest(data: InsertSignatureRequest): Promise<SignatureRequest> {
    const [result] = await db.insert(signatureRequests).values(data).returning();
    return result;
  }

  async getSignatureRequestsByDocument(documentId: string): Promise<SignatureRequest[]> {
    return db.select().from(signatureRequests).where(eq(signatureRequests.documentId, documentId)).orderBy(desc(signatureRequests.createdAt));
  }

  async getSignatureRequestByToken(token: string): Promise<SignatureRequest | undefined> {
    const [result] = await db.select().from(signatureRequests).where(eq(signatureRequests.token, token));
    return result;
  }

  async updateSignatureRequest(id: string, data: Partial<SignatureRequest>): Promise<SignatureRequest | undefined> {
    const [result] = await db.update(signatureRequests).set(data).where(eq(signatureRequests.id, id)).returning();
    return result;
  }

  async getSignatureRequestsByUser(userId: string): Promise<SignatureRequest[]> {
    return db.select().from(signatureRequests).where(eq(signatureRequests.senderUserId, userId)).orderBy(desc(signatureRequests.createdAt));
  }
}

export const storage = new DatabaseStorage();
