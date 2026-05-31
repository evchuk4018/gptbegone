import express, { type Request, type Response } from "express";
import cors from "cors";
import { z } from "zod";
import { createChat, deleteChat, getChat, listChats } from "./storage/chatStore.js";
import { getSettings, updateSettings } from "./storage/settingsStore.js";
import { LlamaCppProvider } from "./providers/llamaCppProvider.js";
import { OllamaProvider } from "./providers/ollamaProvider.js";
import { ChatService } from "./services/chatService.js";
import { ModelCatalogService } from "./services/modelCatalogService.js";
import {
  createChatSchema,
  downloadModelSchema,
  sendMessageSchema,
  updateSettingsSchema
} from "./schemas.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const ollamaProvider = new OllamaProvider(getSettings);
  const llamaCppProvider = new LlamaCppProvider(getSettings);
  const chatService = new ChatService(ollamaProvider, llamaCppProvider);
  const modelCatalog = new ModelCatalogService(ollamaProvider, llamaCppProvider);

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.get("/api/chats", (_req, res) => {
    res.json(listChats());
  });

  app.post("/api/chats", (req, res) => {
    const parsed = createChatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const chat = createChat(parsed.data);
    return res.status(201).json(chat);
  });

  app.get("/api/chats/:id", (req, res) => {
    const chat = getChat(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    return res.json(chat);
  });

  app.delete("/api/chats/:id", (req, res) => {
    const ok = deleteChat(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "Chat not found" });
    }
    return res.status(204).send();
  });

  app.post("/api/chats/:id/stop", (req, res) => {
    chatService.stop(req.params.id);
    return res.status(202).json({ stopped: true });
  });

  app.post("/api/chats/:id/messages", async (req: Request, res: Response) => {
    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const chat = getChat(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    try {
      await chatService.streamReply(
        {
          chatId: req.params.id,
          prompt: parsed.data.prompt,
          provider: parsed.data.provider,
          model: parsed.data.model,
          mode: parsed.data.mode
        },
        (chunk) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      );
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed";
      res.write(`data: ${JSON.stringify({ error: message, done: true })}\n\n`);
    } finally {
      res.end();
    }
  });

  app.get("/api/settings", (_req, res) => {
    res.json(getSettings());
  });

  app.put("/api/settings", (req, res) => {
    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const settings = updateSettings(parsed.data);
    return res.json(settings);
  });

  app.get("/api/models/installed", async (_req, res) => {
    const installed = await modelCatalog.listInstalled();
    return res.json(installed);
  });

  app.post("/api/models/download", async (req, res) => {
    const parsed = downloadModelSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
      if (parsed.data.provider === "ollama") {
        await ollamaProvider.downloadModel({ model: parsed.data.model ?? "" });
      } else {
        await llamaCppProvider.downloadModel({
          hfRepo: parsed.data.hfRepo ?? "",
          fileName: parsed.data.fileName ?? ""
        });
      }
      return res.status(202).json({ accepted: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Download failed";
      return res.status(500).json({ error: message });
    }
  });

  return app;
}
