# GPTBegone Design System

This document defines the visual language for the local-first chatbot so new UI work stays consistent.

For the finance module visual system, see `docs/design-system/money/README.md`.
For the workout module visual system, see `docs/design-system/workout/README.md`.

Workout module direction (latest): mobile-centered dark training tracker with a phone-like canvas and bottom-tab navigation.

## Direction

- Reference style: Claude-like, editorial dark interface.
- Theme mood: warm charcoal and parchment text, not blue/purple neon.
- Product feel: focused, quiet, and readable for long-form chat.

## Color System

- `--bg`: `#141414` main canvas.
- `--panel`: `#1b1b1b` primary surfaces.
- `--panel-soft`: `#232323` secondary surfaces.
- `--line`: `#303030` dividers and low-emphasis borders.
- `--text`: `#e8e0d4` primary text.
- `--muted`: `#a8a099` secondary text.
- `--accent`: `#da6f4a` primary action color.
- `--danger`: `#f47373` destructive/error accent.

Usage rules:
- Keep body text on `--text` over dark surfaces for contrast.
- Use `--muted` for metadata labels and helper text.
- Reserve `--accent` for key actions (`Send`, active controls).
- Reserve `--danger` for delete/destructive semantics.

## Typography

- Display serif (`--serif`): greeting, brand-style headers.
- UI sans (`--sans`): body, controls, metadata.
- Scale:
  - H1: `clamp(34px, 5vw, 56px)`.
  - Body: `16px` base.
  - Metadata: `12px`.

Typography rules:
- Serif only for focal moments; keep controls/body in sans.
- Avoid all-caps for long content.
- Maintain generous line-height for message readability.

## Layout + Spacing

- App shell: 2-column grid (`240px` sidebar + fluid content).
- Sidebar: persistent left rail with recents and bottom-left profile/settings.
- Content max width: `760px` centered for conversation ergonomics.
- Spacing rhythm:
  - Tight: `8px`.
  - Normal: `12px`.
  - Section: `16px`.
  - Large separation: `24px+`.

## Shape Language

- Surface corners:
  - Major cards/composer: `18px`.
  - Inputs/chips/message cards: `10–12px`.
- Buttons:
  - Primary actions and chips favor pill geometry (`999px`) where appropriate.
- Borders:
  - Low-contrast 1px borders for structure, no heavy outlines.

## Component Behavior

- Composer:
  - Single action area toggles between `Send` and `Stop`.
  - Stop immediately aborts active stream; partial assistant text remains.
- Mode chips:
  - `Thinking` and `Flash` are explicit toggles.
  - Flash on-state forces Thinking off, reflected visually.
- Sidebar recents:
  - Active chat has subtle highlighted surface.
  - Delete affordance visible on hover/focus.
- Settings:
  - Accessed from bottom-left profile control.
  - Manages provider defaults/endpoints and model downloads.

## Motion + Interaction

- Keep motion restrained and purposeful:
  - Subtle hover state transitions (`120–180ms`).
  - No large bouncing or novelty transforms.
- Focus states must remain visible for keyboard navigation.

## Responsive Rules

- Under `900px`:
  - Collapse to single-column layout.
  - Sidebar becomes top section with preserved functions.
  - Maintain composer and controls accessibility without horizontal overflow.

## Error + Empty States

- Error banners use warm red backgrounds with clear text.
- Empty chat and empty model lists always show actionable text.
- Unsupported provider/runtime issues must surface clearly (never silent).
