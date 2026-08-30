# System

## Architecture

Candidate Blueprism is a static single-page web application served by `nginx:alpine`.

### Components

- `index.html`: application shell and assessment brief.
- `styles.css`: layout and visual styling.
- `app.js`: client-side editor state, node/connection interactions, undo/redo, zoom, and export behavior.
- `Dockerfile`: packages static assets into an nginx image.
- `k8s/`: deployment, service, config map, and ingress manifests.
- `scripts/deploy.sh`: Docker build/push plus Kubernetes rollout script.

## Runtime ownership

- UI behavior is owned in this repository.
- Kubernetes deployment configuration is owned in this repository.
- Shared deploy timing helpers are loaded from the Alfares `shared` repo.

## Operational notes

- Runtime probe path is `/`.
- Current public host is `candidate-blueprism.alfares.cz`.
- The current image reference in Kubernetes is `localhost:5000/candidate-blueprism:latest`.

## Known gaps

- No repository-defined repository-backed validation script for static UI contract
- No repository-defined documented export file format contract
- No repository-defined explicit source-control remote/origin metadata inside project folder

## Purpose
A static browser-based flowchart editor for the Coffee for Colleagues candidate exercise.

## Responsibilities
Provide the behavior and runtime described by the tracked project documentation.

## Non-Responsibilities
Do not add integrations, persistence, or product scope not declared by repository sources.

## Inputs
Inputs are the browser, runtime, and configuration inputs described in existing project sources.

## Outputs
Outputs are the user-visible or operational results described in existing project sources.

## Dependencies
Static nginx application at candidate-blueprism.alfares.cz with Kubernetes probe path /.

## Upstream Traceability
The approved business baseline and vision define this system’s intent.

## Downstream Artifacts
The integration contract and bootstrap chain record planning evidence.

## Validation Criteria
Run the IPS planning validator and applicable existing project checks.

## Open Questions
No new open question is asserted by this documentation-only adoption.
Status: reviewed
completeness_level: complete
