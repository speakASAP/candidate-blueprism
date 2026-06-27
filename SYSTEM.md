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

- [MISSING: repository-backed validation script for static UI contract]
- [MISSING: documented export file format contract]
- [MISSING: explicit source-control remote/origin metadata inside project folder]
