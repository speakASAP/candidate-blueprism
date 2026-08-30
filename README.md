# Candidate Blueprism

Static browser-based flowchart editor for the Blue Prism candidate exercise.

## Purpose

This project hosts a lightweight assessment UI where a candidate draws a process flow, captures open questions, and exports the result. The current brief is "Coffee for Colleagues Process".

## Runtime

- Public URL: `https://candidate-blueprism.alfares.cz`
- Container: `nginx:alpine`
- Static assets: `index.html`, `styles.css`, `app.js`
- Kubernetes manifests: `k8s/`
- Deploy script: `scripts/deploy.sh`

## Current status

The deployed app is healthy and serves the static assessment UI. There is no active implementation backlog in the repository itself after the documentation/state baseline added on 2026-06-27.

## Status
Status: documented; existing repository status is retained in this file.

## Documentation Authority
Git-tracked project documents and runtime manifests are authoritative.

## Capabilities
A static browser-based flowchart editor for the Coffee for Colleagues candidate exercise.

## Interfaces
Static nginx application at candidate-blueprism.alfares.cz with Kubernetes probe path /.

## Development
Use the repository’s existing development commands and inspect its source before changing behavior.

## Configuration
Configuration is defined by the tracked environment examples and deployment manifests where present.

## Deployment
Deployment is defined by this repository’s tracked runtime configuration.

## Health and Observability
Use the declared runtime probe and ecosystem logging and monitoring paths.
