import { db } from "./db";
import { users, messages, intelLinks, type User, type InsertUser, type Message, type InsertMessage, type IntelLink, type MessageWithUser } from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  getMessages(): Promise<MessageWithUser[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: number): Promise<void>;
  updateMessage(id: number, content: string): Promise<Message>;
  getIntelLinks(): Promise<IntelLink[]>;
  seedIntelLinks(): Promise<void>;
  seedUsers(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated;
  }
  async getMessages(): Promise<MessageWithUser[]> {
    const msgs = await db.select({ message: messages, sender: users }).from(messages).innerJoin(users, eq(messages.userId, users.id)).orderBy(asc(messages.createdAt));
    const result: MessageWithUser[] = [];
    for (const m of msgs) {
      let replyTo: (Message & { sender: User }) | undefined;
      if (m.message.parentId) {
        const [parent] = await db.select({ message: messages, sender: users }).from(messages).innerJoin(users, eq(messages.userId, users.id)).where(eq(messages.id, m.message.parentId));
        if (parent) replyTo = { ...parent.message, sender: parent.sender };
      }
      result.push({ ...m.message, sender: m.sender, replyTo });
    }
    return result;
  }
  async getMessage(id: number): Promise<Message | undefined> {
    const [m] = await db.select().from(messages).where(eq(messages.id, id));
    return m;
  }
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMsg] = await db.insert(messages).values(message).returning();
    return newMsg;
  }
  async deleteMessage(id: number): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
  }
  async updateMessage(id: number, content: string): Promise<Message> {
    const [updated] = await db.update(messages).set({ content }).where(eq(messages.id, id)).returning();
    return updated;
  }
  async getIntelLinks(): Promise<IntelLink[]> {
    return await db.select().from(intelLinks);
  }
  async seedIntelLinks(): Promise<void> {
    const count = await db.select().from(intelLinks);
    if (count.length === 0) {
      await db.insert(intelLinks).values([
        { code: "[REQ_SEC_01]", label: "TurkHackTeam", url: "https://www.turkhackteam.org", category: "security" },
        { code: "[SEC_LOG_01]", label: "Aktif Sızıntı Raporu", url: "#", category: "intel" },
        { code: "[OP_NOD_22]", label: "Düğüm Durum Paneli", url: "#", category: "system" },
      ]);
    }
  }
  async seedUsers(): Promise<void> {
    const admin = await this.getUserByUsername("Raith1905");
    if (!admin) {
      await db.insert(users).values({
        username: "Raith1905",
        password: "Ksb_84_Z0Rd_X99_Phantom_Op_2026!#",
        codeName: "Raith1905",
        rank: "Birlik Komutanı",
        isAdmin: true,
        isVerified: true
      });
    }
  }
}

export const storage = new DatabaseStorage();
