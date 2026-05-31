import { db } from "../db.js";
import type { Settings } from "../types.js";

type SettingsRow = {
  default_provider: "ollama" | "llama-cpp";
  ollama_base_url: string;
  llama_cpp_base_url: string;
  llama_models_dir: string;
};

export function getSettings(): Settings {
  const row = db.prepare("SELECT * FROM settings WHERE id = 1").get() as SettingsRow;
  return {
    defaultProvider: row.default_provider,
    ollamaBaseUrl: row.ollama_base_url,
    llamaCppBaseUrl: row.llama_cpp_base_url,
    llamaModelsDir: row.llama_models_dir
  };
}

export function updateSettings(next: Partial<Settings>): Settings {
  const current = getSettings();
  const merged: Settings = {
    defaultProvider: next.defaultProvider ?? current.defaultProvider,
    ollamaBaseUrl: next.ollamaBaseUrl ?? current.ollamaBaseUrl,
    llamaCppBaseUrl: next.llamaCppBaseUrl ?? current.llamaCppBaseUrl,
    llamaModelsDir: next.llamaModelsDir ?? current.llamaModelsDir
  };

  db.prepare(
    `
    UPDATE settings
    SET default_provider = ?, ollama_base_url = ?, llama_cpp_base_url = ?, llama_models_dir = ?
    WHERE id = 1
  `
  ).run(merged.defaultProvider, merged.ollamaBaseUrl, merged.llamaCppBaseUrl, merged.llamaModelsDir);

  return merged;
}
