# Money Module (Frontend)

Owns `/money` UI and client-side orchestration for hours logging, paycheck checks, budget planning, investment tracking, and money settings.

## Responsibilities

- `MoneyApp.tsx`: route-level module UI and section switching.
- `useMoneyState.ts`: API loading, form state, and submit flows for money features.

## API Assumptions

- Reads/writes only through `/api/money/*` endpoints.
- Uses manual price updates in v1 (no live quote feeds).
