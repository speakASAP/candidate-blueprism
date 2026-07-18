# deploy.config.sh — declaration consumed by shared/scripts/deploy.sh.
# See shared/docs/DEPLOY_STANDARDIZATION_REPORT.md section 6/7 (Phase C) for the design.
# scripts/deploy.sh is still the live, authoritative deploy path.

SERVICE_NAME="candidate-blueprism"
PORT="80"

IMAGES=(
  "candidate-blueprism|.||"
)

DEPLOYMENTS=(
  "candidate-blueprism|app|candidate-blueprism"
)

# No external-secret.yaml for this service.
MANIFESTS=(configmap.yaml deployment.yaml service.yaml ingress.yaml)
