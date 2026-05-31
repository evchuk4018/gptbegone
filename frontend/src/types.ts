export type ProviderName = "ollama" | "llama-cpp";

export type ChatMode = {
  thinking: boolean;
  flash: boolean;
};

export type ChatSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  provider: ProviderName;
  mode: ChatMode;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type ChatDetail = ChatSummary & {
  messages: ChatMessage[];
};

export type InstalledModel = {
  id: string;
  name: string;
  provider: ProviderName;
  source: "installed" | "downloaded";
};

export type Settings = {
  defaultProvider: ProviderName;
  ollamaBaseUrl: string;
  llamaCppBaseUrl: string;
  llamaModelsDir: string;
};
