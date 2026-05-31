import type { ProviderName } from "../types.js";

export type StreamChunkHandler = (chunk: string) => void;

export type ChatStreamInput = {
  model: string;
  prompt: string;
  systemPrompt?: string;
  signal: AbortSignal;
  onChunk: StreamChunkHandler;
};

export type ProviderModel = {
  id: string;
  name: string;
  provider: ProviderName;
};

export interface ModelProvider {
  provider: ProviderName;
  listInstalledModels(): Promise<ProviderModel[]>;
  downloadModel(input: Record<string, string>): Promise<void>;
  streamCompletion(input: ChatStreamInput): Promise<void>;
}
