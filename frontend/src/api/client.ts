import type { ChatDetail, ChatMode, ChatSummary, InstalledModel, ProviderName, Settings } from "../types";

const API = "http://localhost:3001/api";

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, init);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export const api = {
  listChats() {
    return json<ChatSummary[]>("/chats");
  },
  createChat(payload?: Partial<ChatSummary>) {
    return json<ChatSummary>("/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {})
    });
  },
  getChat(chatId: string) {
    return json<ChatDetail>(`/chats/${chatId}`);
  },
  deleteChat(chatId: string) {
    return json<void>(`/chats/${chatId}`, { method: "DELETE" });
  },
  stop(chatId: string) {
    return json<{ stopped: boolean }>(`/chats/${chatId}/stop`, { method: "POST" });
  },
  listInstalledModels() {
    return json<InstalledModel[]>("/models/installed");
  },
  downloadModel(input: { provider: ProviderName; model?: string; hfRepo?: string; fileName?: string }) {
    return json<{ accepted: boolean }>("/models/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  getSettings() {
    return json<Settings>("/settings");
  },
  updateSettings(input: Partial<Settings>) {
    return json<Settings>("/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  async streamMessage(
    chatId: string,
    input: { prompt: string; provider: ProviderName; model: string; mode: ChatMode },
    onChunk: (chunk: string) => void,
    signal: AbortSignal
  ) {
    const res = await fetch(`${API}/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal
    });
    if (!res.ok || !res.body) {
      throw new Error(`Stream failed: ${res.status}`);
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
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";
      for (const event of events) {
        const line = event
          .split("\n")
          .map((l) => l.trim())
          .find((l) => l.startsWith("data: "));
        if (!line) {
          continue;
        }
        const payload = JSON.parse(line.slice(6)) as { chunk?: string; done?: boolean; error?: string };
        if (payload.error) {
          throw new Error(payload.error);
        }
        if (payload.chunk) {
          onChunk(payload.chunk);
        }
        if (payload.done) {
          return;
        }
      }
    }
  }
};
