import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  codeName: text("code_name").notNull(),
  rank: text("rank").default("Operatör").notNull(),
  status: text("status").default("Çevrimiçi").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  isVerified: boolean("is_verified").default(false),
  isAdmin: boolean("is_admin").default(false),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), 
  parentId: integer("parent_id"), 
  content: text("content"),
  isImage: boolean("is_image").default(false),
  imageUrl: text("image_url"),
  operationNote: text("operation_note"), 
  createdAt: timestamp("created_at").defaultNow(),
});

export const intelLinks = pgTable("intel_links", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(), 
  label: text("label").notNull(),
  url: text("url").notNull(),
  category: text("category").default("general"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, isVerified: true, isAdmin: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertIntelLinkSchema = createInsertSchema(intelLinks).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type IntelLink = typeof intelLinks.$inferSelect;

export type MessageWithUser = Message & { 
  sender: User;
  replyTo?: Message & { sender: User };
};

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof loginSchema>;
