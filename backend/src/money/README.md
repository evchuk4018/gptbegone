# Money Module (Backend)

Owns single-user finance and budgeting APIs under `/api/money`.

## Responsibilities

- `router.ts`: money endpoint registration and request validation handling.
- `schemas.ts`: zod request schemas for money APIs.
- `storage/*`: SQLite CRUD for settings, jobs, work logs, budget data, holdings, contributions, and paycheck check history.
- `services/*`: deterministic recommendation logic, paycheck checking, and dashboard aggregation.

## Public Entry Points

- `createMoneyRouter()` mounts the full money API namespace.

## Storage Assumptions

- Single-user local SQLite only.
- No external pricing feeds in v1.
- No background alerting system in v1.
