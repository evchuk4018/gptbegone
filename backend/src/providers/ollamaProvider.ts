import type { Settings } from "../types.js";
import type { ChatStreamInput, ModelProvider, ProviderModel } from "./providerTypes.js";

type OllamaTagResponse = {
  models?: Array<{ name: string }>;
};

function trimSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export class OllamaProvider implements ModelProvider {
  provider = "ollama" as const;

  constructor(private readonly getSettings: () => Settings) {}

  private baseUrl(): string {
    return trimSlash(this.getSettings().ollamaBaseUrl);
  }

  async listInstalledModels(): Promise<ProviderModel[]> {
    const res = await fetch(`${this.baseUrl()}/api/tags`);
    if (!res.ok) {
      throw new Error(`Ollama list failed: ${res.status}`);
    }
    const payload = (await res.json()) as OllamaTagResponse;
    const models = payload.models ?? [];
    return models.map((m) => ({ id: m.name, name: m.name, provider: this.provider }));
  }

  async downloadModel(input: Record<string, string>): Promise<void> {
    const model = input.model;
    if (!model) {
      throw new Error("Ollama download requires model");
    }
    const res = await fetch(`${this.baseUrl()}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: model, stream: false })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama pull failed: ${res.status} ${text}`);
    }
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

    const res = await fetch(`${this.baseUrl()}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: input.signal
    });

    if (!res.ok || !res.body) {
      throw new Error(`Ollama chat failed: ${res.status}`);
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
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          continue;
        }
        try {
          const json = JSON.parse(trimmed) as { message?: { content?: string }; done?: boolean };
          const token = json.message?.content ?? "";
          if (token) {
            input.onChunk(token);
          }
          if (json.done) {
            return;
          }
        } catch {
          continue;
        }
      }
    }
  }
}
