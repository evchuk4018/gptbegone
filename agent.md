# Agent Guidance

## Project Context

This repository is for a single-user local AI assistant app. The product direction is a bare-bones personal AI chat MVP with a polished interface, local-first persistence, and Ollama-based local model management. The broader long-term product is a personal omni-tool, but this repository should only document and implement features that actually exist in the codebase.

## Implemented Features

None yet.

## Engineering Rules

- Keep functions focused on one responsibility.
- Keep files small, modular, and easy to replace.
- Prefer explicit names over clever abstractions.
- Avoid large catch-all components, services, or utility files.
- Keep UI, state, persistence, API/client logic, and model-provider logic separated.
- Do not introduce SQL, remote auth, multi-user architecture, billing, or cloud sync unless a ticket explicitly requires it.
- Treat the app as single-user only.
- Keep local storage simple until a later ticket upgrades persistence.
- Add tests for behavior that can regress.
- Keep errors visible and actionable in the UI.
- Do not hide unsupported model/provider states behind silent failures.
- every feature is under nameofapp.com/nameoffeature
-whenver building frontend use your frontend design skill

## Documentation Rules

- Update nested documentation whenever behavior changes in the matching folder or module.
- Document only implemented behavior, not planned behavior.
- Keep documentation brief and accurate.
- When adding a new folder with meaningful logic, include a short local README or equivalent notes explaining responsibility, public entry points, and storage assumptions.
-Create a seperarte folder that detials design decisons(colors shapes etc) very detialed to ensure a consitent theme across the app
## Suggested Structure Discipline

- One module should own chat state.
- One module should own local persistence.
- One module should own Ollama integration.
- One module should own model catalog/search/download UI behavior.
- UI components should not directly own provider-specific networking details.

## Definition of Done Expectations

- The feature works locally for one user.
- The UI handles loading, empty, success, and error states.
- Related documentation is updated.
- The implementation avoids broad future-proofing for team/multi-user/cloud functionality.
