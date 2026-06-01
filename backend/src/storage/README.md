# Storage Module

Owns local persistence against SQLite (`data/app.db`).

## Responsibilities

- `chatStore.ts`: chat metadata + messages CRUD.
- `settingsStore.ts`: single-user runtime settings CRUD.
- Money-domain persistence lives in `../money/storage/*` to keep finance logic isolated from chat state.

## Public Entry Points

- Chat: `listChats`, `createChat`, `getChat`, `deleteChat`, `appendMessage`, `updateMessageContent`, `updateChatMeta`.
- Settings: `getSettings`, `updateSettings`.

## Storage Assumptions

- Single user only.
- No remote sync.
- Messages are append/update within one local process.
