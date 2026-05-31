# Providers Module

Owns provider-specific model/runtime operations.

## Responsibilities

- `ollamaProvider.ts`: list installed models, pull models, stream chat.
- `llamaCppProvider.ts`: list local GGUF files, download from Hugging Face, stream chat via OpenAI-compatible endpoint.

## Public Entry Points

- Classes implementing `ModelProvider` from `providerTypes.ts`.

## Provider Assumptions

- Ollama is reachable at configured `ollamaBaseUrl`.
- llama.cpp server is reachable at configured `llamaCppBaseUrl`.
- GGUF files for llama.cpp are local files in configured models directory.
