import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  codeName: text("code_name").notNull(),
  rank: text("rank").default("Operatör").notNull(),
  status: text("status").default("Çevrimiçi").notNull(),
  avatarUrl: text("avatar_url"),
  isVerified: boolean("is_verified").default(false),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Linked to users.id
  content: text("content"),
  isImage: boolean("is_image").default(false),
  imageUrl: text("image_url"),
  operationNote: text("operation_note"), // For images
  createdAt: timestamp("created_at").defaultNow(),
});

export const intelLinks = pgTable("intel_links", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(), // e.g. [REQ_SEC_01]
  label: text("label").notNull(),
  url: text("url").notNull(),
  category: text("category").default("general"),
});

// === BASE SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, isVerified: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertIntelLinkSchema = createInsertSchema(intelLinks).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type IntelLink = typeof intelLinks.$inferSelect;

// Combined type for chat display
export type MessageWithUser = Message & { sender: User };

export type CreateMessageRequest = InsertMessage;
export type UpdateProfileRequest = Partial<InsertUser>;
