# Candidate Blueprism Agent Rules

- Remote source of truth path: `/home/ssf/Documents/Github/candidate-blueprism`
- Public runtime: `https://candidate-blueprism.alfares.cz`
- Deploy command: `./scripts/deploy.sh`

## Required chain

Preserve:

`Vision -> Goal Impact -> System -> Feature -> Task -> Execution Plan -> Coding Prompt -> Code -> Validation`

If information is unavailable, mark it as `No repository-defined ...` or `No repository-defined ...`.

## Working rules

- Treat this project as a low-risk static assessment application.
- Prefer small, reviewable edits.
- Do not invent new assessment scope, scoring rules, or business requirements.
- Validate static/runtime behavior after changes.
- Keep deployment ownership in this repo's `scripts/deploy.sh` and `k8s/` manifests unless the task explicitly requires shared deploy changes.

## Current autonomous boundary

- No active bounded implementation lane is open after the baseline documentation/state adoption.
- Future work should start only when the owner adds a new assessment requirement, UX change, export contract, or deployment requirement to `TASKS.md`.

## Required Reading
Read `BUSINESS.md`, `SYSTEM.md`, `TASKS.md`, `STATE.json`, runtime manifests, and numbered IPS artifacts before work.

## Authority
Git-tracked repository contracts are authoritative; protected intent needs owner approval.

## Intent Preservation System
Preserve Vision to Goal Impact to System to Feature to Task to Execution Plan to Coding Prompt to Code to Validation.

## Safety and Operations
Do not expose secrets or alter deployment policy outside pre-existing authorization.

## Project-Specific Rules
Keep changes within the documented Blue Prism candidate assessment scope and runtime boundaries.

## Required Final Report
Report changed files, validation evidence, debt, blockers, deviations, and next action.
