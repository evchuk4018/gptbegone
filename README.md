# gptbegone

Single-user local AI chat app with a Claude-like interface, local SQLite persistence, and model providers for Ollama and llama.cpp.

## Quick Start

```bash
npm install
npm run dev
```

Frontend landing page: `http://localhost:5173/`  
Frontend AI app: `http://localhost:5173/ai`  
Frontend money app: `http://localhost:5173/money`  
Frontend workout app: `http://localhost:5173/workout`  
Backend: `http://localhost:3001`

## Structure

- `frontend/`: React + TypeScript SPA.
- `backend/`: Node + TypeScript API.
- `docs/design-system/`: UI design decisions and standards.
