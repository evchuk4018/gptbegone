# gptbegone

Single-user local AI chat app with a Claude-like interface, local SQLite persistence, and model providers for Ollama and llama.cpp.

## Quick Start

```bash
npm install
npm run dev
```

Frontend landing page: `http://localhost:5173/`  
Frontend app: `http://localhost:5173/ai`  
Backend: `http://localhost:3001`

## Structure

- `frontend/`: React + TypeScript SPA.
- `backend/`: Node + TypeScript API.
- `docs/design-system/`: UI design decisions and standards.
