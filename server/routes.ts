import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await storage.seedUsers();
  await storage.seedIntelLinks();

  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStore({ checkPeriod: 86400000 }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "ksb-secret",
    })
  );

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) return res.status(400).json({ message: "Kullanıcı adı alınmış" });
      const user = await storage.createUser(input);
      // @ts-ignore
      req.session.userId = user.id;
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ message: "Geçersiz veriler" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(input.username);
      if (!user || user.password !== input.password) {
        return res.status(401).json({ message: "Geçersiz giriş" });
      }
      if (user.isBanned) return res.status(403).json({ message: "Hesabınız yasaklanmıştır" });
      // @ts-ignore
      req.session.userId = user.id;
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: "Giriş hatası" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  app.get(api.users.me.path, async (req, res) => {
    // @ts-ignore
    if (!req.session.userId) return res.status(401).json({ message: "Giriş yapın" });
    // @ts-ignore
    const user = await storage.getUser(req.session.userId);
    if (!user) return res.status(404).json({ message: "Bulunamadı" });
    res.json(user);
  });

  app.patch(api.users.update.path, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Yetkisiz" });
    try {
      const input = api.users.update.input.parse(req.body);
      const updated = await storage.updateUser(userId, input);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: "Hata" });
    }
  });

  app.get(api.friends.list.path, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Yetkisiz" });
    res.json(await storage.getFriends(userId));
  });

  app.post(api.friends.request.path, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Yetkisiz" });
    const { username } = req.body;
    try {
      await storage.addFriend(userId, username);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/users/:id/ban", async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Yetkisiz" });
    const user = await storage.getUser(userId);
    if (!user?.isAdmin) return res.status(403).json({ message: "Yetkisiz" });
    const banId = parseInt(req.params.id);
    await storage.banUser(banId);
    res.json({ success: true });
  });

  app.post(api.friends.accept.path, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Yetkisiz" });
    const { friendId } = req.body;
    await storage.acceptFriend(userId, friendId);
    res.json({ success: true });
  });

  app.get(api.messages.list.path, async (req, res) => {
    res.json(await storage.getMessages());
  });

  app.post(api.messages.send.path, async (req, res) => {
    // @ts-ignore
    if (!req.session.userId) return res.status(401).json({ message: "Giriş yapın" });
    try {
      const input = api.messages.send.input.parse(req.body);
      // @ts-ignore
      const message = await storage.createMessage({ ...input, userId: req.session.userId });
      res.status(201).json(message);
    } catch (err) {
      res.status(400).json({ message: "Gönderilemedi" });
    }
  });

  app.delete(api.messages.delete.path, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Yetkisiz" });
    const user = await storage.getUser(userId);
    const msgId = parseInt(req.params.id);
    const msg = await storage.getMessage(msgId);
    if (!msg) return res.status(404).json({ message: "Mesaj yok" });
    if (user?.isAdmin || msg.userId === userId) {
      await storage.deleteMessage(msgId);
      return res.json({ success: true });
    }
    res.status(403).json({ message: "Yetersiz yetki" });
  });

  app.patch(api.messages.update.path, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Yetkisiz" });
    const msgId = parseInt(req.params.id);
    const msg = await storage.getMessage(msgId);
    if (!msg) return res.status(404).json({ message: "Mesaj yok" });
    if (msg.userId !== userId) return res.status(403).json({ message: "Kendi mesajın değil" });
    const input = api.messages.update.input.parse(req.body);
    const updated = await storage.updateMessage(msgId, input.content);
    res.json(updated);
  });

  app.get(api.intel.list.path, async (req, res) => {
    res.json(await storage.getIntelLinks());
  });

  return httpServer;
}
