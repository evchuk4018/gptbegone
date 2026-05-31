import { describe, expect, it } from "vitest";
import { ModelCatalogService } from "../src/services/modelCatalogService.js";

describe("ModelCatalogService", () => {
  it("merges installed models from both providers", async () => {
    const ollamaProvider = {
      provider: "ollama" as const,
      listInstalledModels: async () => [{ id: "llama3", name: "llama3", provider: "ollama" as const }],
      downloadModel: async () => {},
      streamCompletion: async () => {}
    };

    const llamaCppProvider = {
      provider: "llama-cpp" as const,
      listInstalledModels: async () => [{ id: "mistral.gguf", name: "mistral.gguf", provider: "llama-cpp" as const }],
      downloadModel: async () => {},
      streamCompletion: async () => {}
    };

    const svc = new ModelCatalogService(ollamaProvider as any, llamaCppProvider as any);
    const result = await svc.listInstalled();
    expect(result).toHaveLength(2);
    expect(result.find((m) => m.provider === "ollama")?.source).toBe("installed");
    expect(result.find((m) => m.provider === "llama-cpp")?.source).toBe("downloaded");
  });
});
