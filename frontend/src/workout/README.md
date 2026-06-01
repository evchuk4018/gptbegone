# Workout Module (Frontend)

Owns `/workout` UI and client-side orchestration for workouts, templates, PR visibility, calendar/rest-day tracking, and bodyweight logging.

## Responsibilities

- `WorkoutApp.tsx`: route-level workout UI and section switching.
- `useWorkoutState.ts`: API loading, form state, and submit flows for workout features.

## API Assumptions

- Reads/writes only through `/api/workout/*` endpoints.
- PRs and progress are backend-derived from session logs in v1.
