# Candidate Blueprism Agent Rules

- Remote source of truth path: `/home/ssf/Documents/Github/candidate-blueprism`
- Public runtime: `https://candidate-blueprism.alfares.cz`
- Deploy command: `./scripts/deploy.sh`

## Required chain

Preserve:

`Vision -> Goal Impact -> System -> Feature -> Task -> Execution Plan -> Coding Prompt -> Code -> Validation`

If information is unavailable, mark it as `[MISSING: ...]` or `[UNKNOWN: ...]`.

## Working rules

- Treat this project as a low-risk static assessment application.
- Prefer small, reviewable edits.
- Do not invent new assessment scope, scoring rules, or business requirements.
- Validate static/runtime behavior after changes.
- Keep deployment ownership in this repo's `scripts/deploy.sh` and `k8s/` manifests unless the task explicitly requires shared deploy changes.

## Current autonomous boundary

- No active bounded implementation lane is open after the baseline documentation/state adoption.
- Future work should start only when the owner adds a new assessment requirement, UX change, export contract, or deployment requirement to `TASKS.md`.
