import { db } from "./db";
import {
  users, messages, intelLinks,
  type User, type InsertUser,
  type Message, type InsertMessage,
  type IntelLink, type MessageWithUser
} from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  getMessages(): Promise<MessageWithUser[]>;
  createMessage(message: InsertMessage): Promise<Message>;
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
    const msgs = await db.select({
      message: messages,
      sender: users,
    })
    .from(messages)
    .innerJoin(users, eq(messages.userId, users.id))
    .orderBy(asc(messages.createdAt));

    const result: MessageWithUser[] = [];
    for (const m of msgs) {
      let replyTo: (Message & { sender: User }) | undefined;
      if (m.message.parentId) {
        const [parent] = await db.select({
          message: messages,
          sender: users,
        })
        .from(messages)
        .innerJoin(users, eq(messages.userId, users.id))
        .where(eq(messages.id, m.message.parentId));
        
        if (parent) {
          replyTo = { ...parent.message, sender: parent.sender };
        }
      }
      result.push({ ...m.message, sender: m.sender, replyTo });
    }
    return result;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMsg] = await db.insert(messages).values(message).returning();
    return newMsg;
  }

  async getIntelLinks(): Promise<IntelLink[]> {
    return await db.select().from(intelLinks);
  }

  async seedIntelLinks(): Promise<void> {
    const count = await db.select().from(intelLinks);
    if (count.length === 0) {
      await db.insert(intelLinks).values([
        { code: "[REQ_SEC_01]", label: "TurkHackTeam Duyuruları", url: "https://www.turkhackteam.org", category: "security" },
        { code: "[OP_INTEL_01]", label: "Sızma Testi Raporu - Delta", url: "#", category: "intel" },
        { code: "[OP_LOG_99]", label: "Şifrelenmiş Operasyon Günlükleri", url: "#", category: "logs" },
        { code: "[SYS_STAT]", label: "Merkezi İşlem Birimi Durumu", url: "#", category: "system" },
      ]);
    }
  }

  async seedUsers(): Promise<void> {
    const count = await db.select().from(users);
    if (count.length === 0) {
      await db.insert(users).values([
        { 
          username: "admin", 
          password: "password123", 
          codeName: "Komuta", 
          rank: "Sistem Yöneticisi", 
          status: "Gizli", 
          isVerified: true,
          bio: "KSB Sistem Kontrol Birimi"
        },
      ]);
    }
  }
}

export const storage = new DatabaseStorage();
