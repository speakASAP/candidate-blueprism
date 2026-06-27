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
