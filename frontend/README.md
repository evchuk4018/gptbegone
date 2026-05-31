# Frontend

React + Vite single-page app.

## Routes

- `/`: basic landing page that points users to the app route.
- `/ai`: main chat app.
- `/ai/chat/:chatId`: specific chat session.

## Deploy Path

Vite is configured with `base: "/ai/"` so built assets resolve from the `/ai` path.
