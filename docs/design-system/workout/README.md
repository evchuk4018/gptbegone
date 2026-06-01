# Workout Module Design System

Defines the visual and interaction system for `/workout`.

## Narrative Direction

- Theme: performance logbook for serious training sessions.
- Mood: deep dark, focused, and metric-first.
- Device framing: mobile-native even on desktop, with a centered phone canvas and restrained tablet expansion.

## Color Tokens

- `--workout-bg`: `#05080d` app backdrop base.
- `--workout-bg-soft`: `#0c111a` secondary backdrop support.
- `--workout-card`: `#111824` primary card surface.
- `--workout-card-elevated`: `#162131` elevated cards or grouped controls.
- `--workout-ink`: `#f2f7ff` primary text.
- `--workout-muted`: `#95a9c4` secondary metadata and helper text.
- `--workout-line`: `#25354c` structural borders and separators.
- `--workout-accent`: `#2f7dff` primary action and active navigation.
- `--workout-accent-ink`: `#eaf2ff` text/icons on accent surfaces.
- `--workout-success`: `#6ecf73` completed/progress success cues.
- `--workout-danger`: `#f08d8d` destructive/error emphasis.

Usage rules:
- Avoid true black cards; maintain layered dark surfaces for hierarchy.
- Keep strongest chroma on primary CTAs and active nav only.
- Use danger red only for failures and blocking issues.

## Typography

- Display serif: `Garamond` family for route title and major card headings.
- UI sans: `Segoe UI` + `Trebuchet MS` for forms, metrics, and navigation.
- Scale guidance:
  - Route title: ~`36px`.
  - Section heading: ~`23px`.
  - Body/metrics: `13-16px`.
  - Metadata labels: `11-12px`.

## Layout + Components

- Main container:
  - centered canvas (`~440px` mobile, `~540px` desktop hybrid),
  - rounded frame with subtle elevated shadow.
- Top area:
  - sticky-feeling app header with online/offline status pill.
  - compact cross-module links directly below header.
- Content:
  - stack-based cards and list items,
  - minimal horizontal scrolling,
  - forms grouped in 2-column mobile grids, expanding to 3 columns on larger screens.
- Navigation:
  - persistent bottom tab bar for primary workout sections.
  - segmented pills inside `More` for secondary views.

## Motion + Interaction

- Interaction timing stays restrained (`120-180ms` transitions).
- Feedback emphasis:
  - active tab/segment via accent fill and border,
  - hover/focus via contrast shift, not heavy transforms.
- Inputs and actions prioritize tap ergonomics (minimum ~44px controls).

## Responsive Rules

- Base behavior is mobile-first at all widths.
- Desktop (`>=980px`):
  - keep mobile framing and dark atmosphere,
  - allow tablet-like grid only for dense progress content.
- Never switch to wide desktop table paradigms by default.

## States and Accessibility

- Loading: informative sync banner.
- Offline:
  - explicit offline pill + contextual banner,
  - read views continue when cached data exists.
- Errors:
  - red-tinted banner with concrete remediation language.
- Contrast:
  - body copy on dark surfaces must remain high contrast and readable for long sessions.
