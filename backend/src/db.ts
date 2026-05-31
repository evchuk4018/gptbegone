import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { appDataDir, defaultModelsDir } from "./utils.js";

const dbPath = path.join(appDataDir, "app.db");

if (!fs.existsSync(appDataDir)) {
  fs.mkdirSync(appDataDir, { recursive: true });
}
if (!fs.existsSync(defaultModelsDir)) {
  fs.mkdirSync(defaultModelsDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('ollama', 'llama-cpp')),
  thinking INTEGER NOT NULL DEFAULT 1,
  flash INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  default_provider TEXT NOT NULL CHECK (default_provider IN ('ollama', 'llama-cpp')),
  ollama_base_url TEXT NOT NULL,
  llama_cpp_base_url TEXT NOT NULL,
  llama_models_dir TEXT NOT NULL
);
`);

db.exec(`
INSERT INTO settings (id, default_provider, ollama_base_url, llama_cpp_base_url, llama_models_dir)
SELECT 1, 'ollama', 'http://127.0.0.1:11434', 'http://127.0.0.1:8080', '${defaultModelsDir.replace(/\\/g, "/")}'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 1);
`);

export { db };

export function resetForTests(): void {
  db.exec("DELETE FROM messages;");
  db.exec("DELETE FROM chats;");
}
