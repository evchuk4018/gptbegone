# Workout Module (Backend)

Owns single-user workout tracking APIs under `/api/workout`.

## Responsibilities

- `router.ts`: workout endpoint registration and request validation handling.
- `schemas.ts`: zod request schemas for workout APIs.
- `storage/*`: SQLite CRUD for exercises, templates, sessions, day status, and bodyweight entries.
- `services/*`: derived progress-series and automatic PR calculations.

## Public Entry Points

- `createWorkoutRouter()` mounts the full workout API namespace.

## Storage Assumptions

- Single-user local SQLite only.
- PRs are derived from logged sessions (no manual PR flags in v1).
- No recurring schedule planner in v1.
