# Workout Module Design System

This document defines the visual language for `/workout` so training-related screens stay consistent.

## Narrative Direction

- Theme: field-journal training board with clean green analytics accents.
- Mood: disciplined, energetic, and practical rather than neon or gamified.
- Memory hook: "coach notebook meets progress dashboard."

## Color Tokens

- `--workout-bg`: `#eff4ee`
- `--workout-ink`: `#1d3027`
- `--workout-muted`: `#496457`
- `--workout-accent`: `#17694b`
- `--workout-accent-soft`: `#d7ece2`
- `--workout-line`: `#b6d0c1`

Usage:
- Keep surfaces bright and data-forward.
- Reserve accent green for action buttons and selected tabs.
- Keep error surfaces warm red only when needed.

## Typography and Layout

- Display font: `Optima`/serif blend for title + card headings.
- UI font: `Trebuchet MS` family for controls and tables.
- Layout grid:
  - 12-column card layout.
  - Regular cards span 4 columns.
  - Data-heavy cards span 8 columns.
- Mobile:
  - Under `1100px`, cards collapse to full width.
  - Under `700px`, forms collapse to one column.

## Shape and Components

- Cards: 18px radius with low-contrast green border.
- Tabs and nav links: pill geometry (`999px` radius).
- Inputs: 10px radius on light neutral fill.
- Data tables: thin row separators, no dense boxed grids.

## Data Presentation Rules

- Workout logs should display key set metrics in scan-friendly columns.
- Progress and PR tables should separate strength and cardio semantics.
- Calendar output should always include date, session count, and rest-day flag.
