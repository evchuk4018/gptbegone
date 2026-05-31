# Chat State Module

Owns client-side chat UI state and orchestration.

## Responsibilities

- Bootstrapping chats/settings/models.
- Active chat lifecycle (new/open/delete).
- Prompt send flow with stream accumulation.
- Stop/cancel flow and partial message preservation.
- Thinking/Flash mode normalization.

## Public Entry Point

- `useChatState()`
