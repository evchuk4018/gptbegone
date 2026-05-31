import {
  appendMessage,
  getChat,
  updateChatMeta,
  updateMessageContent
} from "../storage/chatStore.js";
import type { ChatMode, ProviderName } from "../types.js";
import type { LlamaCppProvider } from "../providers/llamaCppProvider.js";
import type { OllamaProvider } from "../providers/ollamaProvider.js";

type SendMessageInput = {
  chatId: string;
  prompt: string;
  provider: ProviderName;
  model: string;
  mode: ChatMode;
};

export class ChatService {
  private abortControllers = new Map<string, AbortController>();

  constructor(
    private readonly ollamaProvider: OllamaProvider,
    private readonly llamaCppProvider: LlamaCppProvider
  ) {}

  stop(chatId: string): void {
    const controller = this.abortControllers.get(chatId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(chatId);
    }
  }

  async streamReply(input: SendMessageInput, onChunk: (chunk: string) => void): Promise<string> {
    const chat = getChat(input.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    const normalizedMode: ChatMode = {
      flash: input.mode.flash,
      thinking: input.mode.flash ? false : input.mode.thinking
    };

    updateChatMeta(input.chatId, {
      model: input.model,
      provider: input.provider,
      mode: normalizedMode,
      title: chat.messages.length === 0 ? input.prompt.slice(0, 60) || "New chat" : undefined
    });

    appendMessage(input.chatId, "user", input.prompt);
    const assistant = appendMessage(input.chatId, "assistant", "");

    const controller = new AbortController();
    this.abortControllers.set(input.chatId, controller);

    const systemPrompt = normalizedMode.flash
      ? "You are in flash mode: prioritize concise, fast responses."
      : normalizedMode.thinking
        ? "You are in thinking mode: reason carefully and provide high-quality responses."
        : undefined;

    let assembled = "";
    try {
      const provider = input.provider === "ollama" ? this.ollamaProvider : this.llamaCppProvider;
      await provider.streamCompletion({
        model: input.model,
        prompt: input.prompt,
        systemPrompt,
        signal: controller.signal,
        onChunk: (chunk) => {
          assembled += chunk;
          updateMessageContent(assistant.id, assembled);
          onChunk(chunk);
        }
      });
    } finally {
      this.abortControllers.delete(input.chatId);
    }

    return assembled;
  }
}
