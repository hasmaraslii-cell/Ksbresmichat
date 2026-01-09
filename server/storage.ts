import { db } from "./db";
import {
  users, messages, intelLinks,
  type User, type InsertUser,
  type Message, type InsertMessage,
  type IntelLink, type MessageWithUser
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getAnyUser(): Promise<User | undefined>; // For demo purposes, get the first user
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  // Messages
  getMessages(): Promise<MessageWithUser[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Intel
  getIntelLinks(): Promise<IntelLink[]>;
  seedIntelLinks(): Promise<void>;
  seedUsers(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAnyUser(): Promise<User | undefined> {
    const [user] = await db.select().from(users).limit(1);
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
    // Join messages with users to get sender info
    // This is a manual join in application logic or query builder
    const msgs = await db.select({
      message: messages,
      sender: users,
    })
    .from(messages)
    .innerJoin(users, eq(messages.userId, users.id))
    .orderBy(desc(messages.createdAt)); // Newest first

    // Flatten structure to match MessageWithUser
    return msgs.map(({ message, sender }) => ({
      ...message,
      sender,
    })).reverse(); // Return oldest first for chat flow
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
        { code: "[REQ_SEC_01]", label: "TurkHackTeam", url: "https://www.turkhackteam.org", category: "security" },
        { code: "[REQ_SEC_02]", label: "BreachForums", url: "#", category: "intel" },
        { code: "[OP_LOG_99]", label: "Operasyon Kayıtları", url: "#", category: "logs" },
        { code: "[SYS_STAT]", label: "Sistem Durumu", url: "#", category: "system" },
      ]);
    }
  }

  async seedUsers(): Promise<void> {
    const count = await db.select().from(users);
    if (count.length === 0) {
      await db.insert(users).values([
        { codeName: "Gölge_01", rank: "Kıdemli Operatör", status: "Çevrimiçi", isVerified: true },
        { codeName: "Komuta", rank: "Admin", status: "Gizli", isVerified: true },
      ]);
    }
  }
}

export const storage = new DatabaseStorage();
