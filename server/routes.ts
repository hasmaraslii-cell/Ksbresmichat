import session from "express-session";
import createMemoryStore from "memorystore";
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed data on startup
  await storage.seedUsers();
  await storage.seedIntelLinks();

  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "ksb-secret",
    })
  );

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Kullanıcı adı zaten alınmış" });
      }
      const user = await storage.createUser(input);
      // @ts-ignore
      req.session.userId = user.id;
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    const input = api.auth.login.input.parse(req.body);
    const user = await storage.getUserByUsername(input.username);
    if (!user || user.password !== input.password) {
      return res.status(401).json({ message: "Geçersiz kullanıcı adı veya şifre" });
    }
    // @ts-ignore
    req.session.userId = user.id;
    res.json(user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Çıkış yapılamadı" });
      res.json({ success: true });
    });
  });

  app.get(api.users.me.path, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.patch(api.users.update.path, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const input = api.users.update.input.parse(req.body);
      const updated = await storage.updateUser(userId, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Güncelleme hatası" });
    }
  });

  app.get(api.messages.list.path, async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post(api.messages.send.path, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const input = api.messages.send.input.parse(req.body);
      const message = await storage.createMessage({
        ...input,
        userId: userId
      });
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Mesaj gönderilemedi" });
    }
  });

  app.get(api.intel.list.path, async (req, res) => {
    const links = await storage.getIntelLinks();
    res.json(links);
  });

  return httpServer;
}
