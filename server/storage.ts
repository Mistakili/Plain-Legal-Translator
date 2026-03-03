import { type Document, type InsertDocument, type ChatMessage, type InsertChatMessage, documents, chatMessages } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

export interface IStorage {
  createDocument(doc: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  updateDocument(id: string, data: Partial<Document>): Promise<Document | undefined>;
  getDocuments(): Promise<Document[]>;
  deleteDocument(id: string): Promise<void>;
  createChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(documentId: string): Promise<ChatMessage[]>;
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export class DatabaseStorage implements IStorage {
  async createDocument(doc: InsertDocument): Promise<Document> {
    const [result] = await db.insert(documents).values(doc).returning();
    return result;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [result] = await db.select().from(documents).where(eq(documents.id, id));
    return result;
  }

  async updateDocument(id: string, data: Partial<Document>): Promise<Document | undefined> {
    const [result] = await db.update(documents).set(data).where(eq(documents.id, id)).returning();
    return result;
  }

  async getDocuments(): Promise<Document[]> {
    return db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async deleteDocument(id: string): Promise<void> {
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
}

export const storage = new DatabaseStorage();
