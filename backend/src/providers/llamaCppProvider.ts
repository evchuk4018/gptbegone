import fs from "node:fs";
import path from "node:path";
import type { Settings } from "../types.js";
import type { ChatStreamInput, ModelProvider, ProviderModel } from "./providerTypes.js";

function trimSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export class LlamaCppProvider implements ModelProvider {
  provider = "llama-cpp" as const;

  constructor(private readonly getSettings: () => Settings) {}

  private baseUrl(): string {
    return trimSlash(this.getSettings().llamaCppBaseUrl);
  }

  private modelsDir(): string {
    return this.getSettings().llamaModelsDir;
  }

  async listInstalledModels(): Promise<ProviderModel[]> {
    const dir = this.modelsDir();
    ensureDir(dir);
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".gguf"))
      .sort((a, b) => a.localeCompare(b));
    return files.map((f) => ({ id: f, name: f, provider: this.provider }));
  }

  async downloadModel(input: Record<string, string>): Promise<void> {
    const hfRepo = input.hfRepo;
    const fileName = input.fileName;
    if (!hfRepo || !fileName) {
      throw new Error("llama.cpp download requires hfRepo and fileName");
    }
    const dir = this.modelsDir();
    ensureDir(dir);
    const safeFile = sanitizeFileName(fileName);
    const url = `https://huggingface.co/${hfRepo}/resolve/main/${fileName}`;
    const res = await fetch(url);
    if (!res.ok || !res.body) {
      throw new Error(`Hugging Face download failed: ${res.status}`);
    }
    const outPath = path.join(dir, safeFile);
    const ws = fs.createWriteStream(outPath);
    const reader = res.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      ws.write(value);
    }
    ws.end();
  }

  async streamCompletion(input: ChatStreamInput): Promise<void> {
    const payload = {
      model: input.model,
      stream: true,
      messages: [
        ...(input.systemPrompt ? [{ role: "system", content: input.systemPrompt }] : []),
        { role: "user", content: input.prompt }
      ]
    };
    const res = await fetch(`${this.baseUrl()}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: input.signal
    });
    if (!res.ok || !res.body) {
      throw new Error(`llama.cpp chat failed: ${res.status}`);
    }

    const decoder = new TextDecoder();
    let buffer = "";
    const reader = res.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        for (const line of part.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) {
            continue;
          }
          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            return;
          }
          try {
            const json = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const token = json.choices?.[0]?.delta?.content ?? "";
            if (token) {
              input.onChunk(token);
            }
          } catch {
            continue;
          }
        }
      }
    }
  }
}
