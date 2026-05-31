import type { InstalledModel } from "../types.js";
import type { LlamaCppProvider } from "../providers/llamaCppProvider.js";
import type { OllamaProvider } from "../providers/ollamaProvider.js";

export class ModelCatalogService {
  constructor(
    private readonly ollamaProvider: OllamaProvider,
    private readonly llamaCppProvider: LlamaCppProvider
  ) {}

  async listInstalled(): Promise<InstalledModel[]> {
    const [ollama, llama] = await Promise.all([
      this.ollamaProvider.listInstalledModels().catch(() => []),
      this.llamaCppProvider.listInstalledModels().catch(() => [])
    ]);
    return [
      ...ollama.map((m) => ({ id: m.id, name: m.name, provider: m.provider, source: "installed" as const })),
      ...llama.map((m) => ({ id: m.id, name: m.name, provider: m.provider, source: "downloaded" as const }))
    ];
  }
}
