import { db } from "./db";
import { users, messages, intelLinks, friends, type User, type InsertUser, type Message, type InsertMessage, type IntelLink, type MessageWithUser, type Friend } from "@shared/schema";
import { eq, desc, asc, and, or, ne, inArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  searchUsers(query: string, excludeId: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  getMessages(): Promise<MessageWithUser[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: number): Promise<void>;
  updateMessage(id: number, content: string): Promise<Message>;
  getIntelLinks(): Promise<IntelLink[]>;
  getFriends(userId: number): Promise<(User & { friendStatus: string })[]>;
  addFriend(userId: number, friendId: number): Promise<void>;
  acceptFriend(userId: number, friendId: number): Promise<void>;
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
  async searchUsers(query: string, excludeId: number): Promise<User[]> {
    return await db.select().from(users).where(and(eq(users.username, query), ne(users.id, excludeId)));
  }
  async banUser(id: number): Promise<void> {
    await db.update(users).set({ isBanned: true }).where(eq(users.id, id));
  }
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated;
  }
  async getMessages(currentUserId?: number, targetId?: number): Promise<MessageWithUser[]> {
    const messagesData = await db.select({ message: messages, sender: users })
      .from(messages)
      .innerJoin(users, eq(messages.userId, users.id))
      .orderBy(asc(messages.createdAt));

    let filteredMessages = messagesData;

    if (targetId) {
      // DM: messages between currentUserId and targetId
      filteredMessages = messagesData.filter(m => 
        (m.message.userId === currentUserId && m.message.receiverId === targetId) ||
        (m.message.userId === targetId && m.message.receiverId === currentUserId)
      );
    } else {
      // Group: messages where receiverId is null
      filteredMessages = messagesData.filter(m => m.message.receiverId === null);
    }

    const result: MessageWithUser[] = [];
    for (const m of filteredMessages) {
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
  async getFriends(userId: number): Promise<(User & { friendStatus: string })[]> {
    const userFriends = await db.select().from(friends).where(or(eq(friends.userId, userId), eq(friends.friendId, userId)));
    const friendIds = userFriends.map(f => f.userId === userId ? f.friendId : f.userId);
    if (friendIds.length === 0) return [];
    
    const friendUsers = await db.select().from(users).where(inArray(users.id, friendIds));
    return friendUsers.map(u => {
      const relation = userFriends.find(f => f.userId === u.id || f.friendId === u.id);
      return { ...u, friendStatus: relation?.status || 'none' };
    });
  }
  async addFriend(userId: number, friendUsername: string): Promise<void> {
    const [friend] = await db.select().from(users).where(eq(users.username, friendUsername));
    if (!friend) throw new Error("Kullanıcı bulunamadı");
    if (friend.id === userId) throw new Error("Kendinizi ekleyemezsiniz");
    
    const [existing] = await db.select().from(friends).where(
      or(
        and(eq(friends.userId, userId), eq(friends.friendId, friend.id)),
        and(eq(friends.userId, friend.id), eq(friends.friendId, userId))
      )
    );
    
    if (existing) {
      if (existing.status === 'accepted') throw new Error("Zaten arkadaşsınız");
      if (existing.userId === userId) throw new Error("İstek zaten gönderildi");
      await db.update(friends).set({ status: 'accepted' }).where(eq(friends.id, existing.id));
      return;
    }

    await db.insert(friends).values({ userId, friendId: friend.id, status: 'pending' });
  }

  async clearDataExceptAdmin(): Promise<void> {
    const admin = await this.getUserByUsername("Raith1905");
    if (!admin) return;
    
    await db.delete(messages);
    await db.delete(friends);
    await db.delete(users).where(ne(users.id, admin.id));
  }
  async acceptFriend(userId: number, friendId: number): Promise<void> {
    await db.update(friends).set({ status: 'accepted' }).where(and(eq(friends.userId, friendId), eq(friends.friendId, userId)));
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
        isAdmin: true,
        isVerified: true
      });
    }
  }
}

export const storage = new DatabaseStorage();
