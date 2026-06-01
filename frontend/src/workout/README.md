# Workout Module (Frontend)

Owns the `/workout` route as a mobile-centered dark experience with PWA installability and offline-aware messaging.

## Responsibilities

- `WorkoutApp.tsx`: mobile app shell, bottom navigation, card/list rendering, and section composition.
- `useWorkoutState.ts`: workout snapshot loading, form state, mutation submits, and online/offline guardrails.

## Information Architecture

- Primary tabs: `Overview`, `Log Workout`, `Templates`, `Progress`, `More`.
- `More` includes secondary views for `Calendar` and `Bodyweight`.
- Desktop keeps mobile visual language via a centered phone-like canvas and selective tablet expansion for dense progress cards.

## Offline + PWA Behavior

- PWA shell and service worker are app-level, with workout-first launch (`/workout`).
- `GET /api/workout/*` requests are runtime cached (network-first with cache fallback).
- Non-GET workout writes are online-only; offline writes show actionable UI errors.
- When offline, UI shows explicit state and uses last-synced data when available.

## API Assumptions

- Uses existing `/api/workout/*` endpoints only.
- No backend contract changes; progress and PRs remain backend-derived.
