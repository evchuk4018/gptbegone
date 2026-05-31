# Services Module

Owns orchestration logic that composes storage and providers.

## Responsibilities

- `chatService.ts`: stream generation flow, mode normalization, stop/cancel handling.
- `modelCatalogService.ts`: merged installed model view across providers.

## Public Entry Points

- `ChatService`
- `ModelCatalogService`

## Behavioral Notes

- Flash mode forces thinking off.
- Stop cancels active stream and preserves already-written assistant text.
