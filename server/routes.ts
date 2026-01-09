import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed data on startup
  await storage.seedUsers();
  await storage.seedIntelLinks();

  // Middleware to simulate a logged-in user (DEMO ONLY)
  // In a real app, this would be replaced by auth middleware
  app.use(async (req, res, next) => {
    if (!req.path.startsWith('/api')) return next();
    
    // Auto-login as the first user (Gölge_01)
    const user = await storage.getAnyUser();
    if (user) {
      // @ts-ignore
      req.user = user;
    }
    next();
  });

  app.get(api.users.me.path, async (req, res) => {
    // @ts-ignore
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.patch(api.users.update.path, async (req, res) => {
    // @ts-ignore
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    try {
      const input = api.users.update.input.parse(req.body);
      const updated = await storage.updateUser(user.id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.messages.list.path, async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post(api.messages.send.path, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const input = api.messages.send.input.parse(req.body);
      
      // Force the sender to be the current user
      const message = await storage.createMessage({
        ...input,
        userId: user.id
      });
      
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.intel.list.path, async (req, res) => {
    const links = await storage.getIntelLinks();
    res.json(links);
  });

  return httpServer;
}
