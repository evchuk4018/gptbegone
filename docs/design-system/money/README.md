# Money Module Design System

This document defines the visual language for `/money` so all new finance/budget screens stay cohesive.

## Narrative Direction

- Theme: print-editorial finance terminal with warm paper surfaces and deep green controls.
- Mood: calm and analytical, not high-volatility neon trading UI.
- Memory hook: "capital ledger on a drafting table".

## Color Tokens

- `--money-bg`: `#f2efe5` foundational paper tone.
- `--money-ink`: `#23201b` primary text and data ink.
- `--money-muted`: `#6c6158` helper text.
- `--money-accent`: `#1f5a41` primary actions and active tab state.
- `--money-accent-soft`: `#d7e5dc` secondary highlight.
- `--money-line`: `#c4b8a7` structural borders.

Usage:
- Keep card surfaces semi-opaque white to preserve hierarchy on textured background.
- Use accent green only for intent actions and active navigation.
- Use warm red only for errors; never for standard metric deltas.

## Typography and Layout

- Display font: `Baskerville` family for page title and section headings.
- UI font: `Gill Sans` family for body copy and table metrics.
- Layout grid:
  - Primary: 12-column responsive content grid.
  - Standard cards: 4 columns.
  - Detail cards/forms/tables: 8 columns.
- Mobile collapse:
  - Under 1100px, all cards span full width.
  - Under 700px, forms collapse to single-column inputs.

## Shape and Components

- Cards: 18px radius with low-contrast border and soft shadow.
- Pills (tabs and top links): 999px radius.
- Inputs: 10px radius with light paper fill.
- Tables: thin horizontal row separators, no heavy box grid.
- Progress bars: rounded capsule with amber-to-green gradient.

## Motion and Interaction

- Interaction style: restrained, confidence-focused.
- Hover and active emphasis should rely on color transition and subtle depth changes.
- Avoid jumpy chart-like animations in v1.

## Data Presentation Rules

- Currency values always use USD format in v1.
- Recommendation outputs should be grouped by intent in this order: Spend, Cash, Invest.
- FI projection should always show both target dollars and percent progress.
- Table density should prioritize scan speed over decorative padding.
