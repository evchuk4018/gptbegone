import { beforeEach, describe, expect, it } from "vitest";
import { ChatService } from "../src/services/chatService.js";
import { createChat, getChat } from "../src/storage/chatStore.js";
import { resetForTests } from "../src/db.js";

describe("ChatService", () => {
  beforeEach(() => {
    resetForTests();
  });

  it("forces thinking off when flash is on", async () => {
    const chat = createChat();
    const ollamaProvider = {
      provider: "ollama" as const,
      listInstalledModels: async () => [],
      downloadModel: async () => {},
      streamCompletion: async (input: any) => {
        input.onChunk("hello");
      }
    };
    const llamaCppProvider = {
      provider: "llama-cpp" as const,
      listInstalledModels: async () => [],
      downloadModel: async () => {},
      streamCompletion: async () => {}
    };

    const service = new ChatService(ollamaProvider as any, llamaCppProvider as any);
    await service.streamReply(
      {
        chatId: chat.id,
        prompt: "Ping",
        provider: "ollama",
        model: "llama3",
        mode: { thinking: true, flash: true }
      },
      () => {}
    );

    const updated = getChat(chat.id);
    expect(updated?.mode.flash).toBe(true);
    expect(updated?.mode.thinking).toBe(false);
    expect(updated?.messages.at(-1)?.content).toBe("hello");
  });
});
