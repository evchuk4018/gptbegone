# Frontend

React + Vite single-page app.

## Routes

- `/`: module landing page with links.
- `/ai`: main chat app.
- `/ai/chat/:chatId`: specific chat session.
- `/money`: finance and budget tracker module.
- `/workout`: workout logging and progress tracking module.

## Deploy Path

Vite is configured with `base: "/"` so `/`, `/ai`, `/money`, and `/workout` all resolve correctly.
