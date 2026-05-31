import { db } from "../db.js";
import type { ChatDetail, ChatMessage, ChatMode, ChatSummary, ProviderName } from "../types.js";
import { createId, nowIso } from "../utils.js";

type ChatRow = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  model: string;
  provider: ProviderName;
  thinking: number;
  flash: number;
};

type MessageRow = {
  id: string;
  chat_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

function toMode(row: { thinking: number; flash: number }): ChatMode {
  return { thinking: Boolean(row.thinking), flash: Boolean(row.flash) };
}

function toSummary(row: ChatRow): ChatSummary {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    model: row.model,
    provider: row.provider,
    mode: toMode(row)
  };
}

function toMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    chatId: row.chat_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at
  };
}

export function listChats(): ChatSummary[] {
  const rows = db.prepare("SELECT * FROM chats ORDER BY updated_at DESC").all() as ChatRow[];
  return rows.map(toSummary);
}

export function createChat(input?: {
  title?: string;
  model?: string;
  provider?: ProviderName;
  mode?: ChatMode;
}): ChatSummary {
  const now = nowIso();
  const id = createId();
  const title = input?.title?.trim() || "New chat";
  const model = input?.model || "llama3.1:8b";
  const provider = input?.provider || "ollama";
  const thinking = input?.mode?.thinking ?? true;
  const flash = input?.mode?.flash ?? false;

  db.prepare(
    `
    INSERT INTO chats (id, title, created_at, updated_at, model, provider, thinking, flash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(id, title, now, now, model, provider, Number(thinking), Number(flash));

  const row = db.prepare("SELECT * FROM chats WHERE id = ?").get(id) as ChatRow;
  return toSummary(row);
}

export function getChat(chatId: string): ChatDetail | null {
  const chat = db.prepare("SELECT * FROM chats WHERE id = ?").get(chatId) as ChatRow | undefined;
  if (!chat) {
    return null;
  }
  const messages = db
    .prepare("SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC")
    .all(chatId) as MessageRow[];
  return { ...toSummary(chat), messages: messages.map(toMessage) };
}

export function deleteChat(chatId: string): boolean {
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM messages WHERE chat_id = ?").run(chatId);
    return db.prepare("DELETE FROM chats WHERE id = ?").run(chatId);
  });
  const res = tx();
  return res.changes > 0;
}

export function appendMessage(chatId: string, role: "user" | "assistant" | "system", content: string): ChatMessage {
  const id = createId();
  const createdAt = nowIso();
  db.prepare(
    `
    INSERT INTO messages (id, chat_id, role, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run(id, chatId, role, content, createdAt);
  db.prepare("UPDATE chats SET updated_at = ? WHERE id = ?").run(createdAt, chatId);
  return { id, chatId, role, content, createdAt };
}

export function updateMessageContent(messageId: string, content: string): void {
  db.prepare("UPDATE messages SET content = ? WHERE id = ?").run(content, messageId);
}

export function updateChatMeta(
  chatId: string,
  input: { title?: string; model?: string; provider?: ProviderName; mode?: ChatMode }
): void {
  const now = nowIso();
  if (input.title !== undefined) {
    db.prepare("UPDATE chats SET title = ?, updated_at = ? WHERE id = ?").run(input.title, now, chatId);
  }
  if (input.model !== undefined) {
    db.prepare("UPDATE chats SET model = ?, updated_at = ? WHERE id = ?").run(input.model, now, chatId);
  }
  if (input.provider !== undefined) {
    db.prepare("UPDATE chats SET provider = ?, updated_at = ? WHERE id = ?").run(input.provider, now, chatId);
  }
  if (input.mode !== undefined) {
    db.prepare("UPDATE chats SET thinking = ?, flash = ?, updated_at = ? WHERE id = ?").run(
      Number(input.mode.thinking),
      Number(input.mode.flash),
      now,
      chatId
    );
  }
}
