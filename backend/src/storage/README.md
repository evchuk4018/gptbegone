# Storage Module

Owns local persistence against SQLite (`data/app.db`).

## Responsibilities

- `chatStore.ts`: chat metadata + messages CRUD.
- `settingsStore.ts`: single-user runtime settings CRUD.

## Public Entry Points

- Chat: `listChats`, `createChat`, `getChat`, `deleteChat`, `appendMessage`, `updateMessageContent`, `updateChatMeta`.
- Settings: `getSettings`, `updateSettings`.

## Storage Assumptions

- Single user only.
- No remote sync.
- Messages are append/update within one local process.
