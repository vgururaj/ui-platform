#!/usr/bin/env sh
# Build once, run with runtime env injected into config.js at container start.
set -eu
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

sh scripts/docker-build.sh

TAG="${DOCKER_IMAGE_TAG:-ui-platform-demo:local}"

if [ -f .env ]; then
  exec docker run --rm -p 8080:8080 --env-file .env "$TAG"
fi

exec docker run --rm -p 8080:8080 \
  -e "VITE_APP_ENV=${VITE_APP_ENV:-local}" \
  -e "VITE_APP_NAME=${VITE_APP_NAME:-ui-platform demo}" \
  -e "VITE_API_BASE_URL=${VITE_API_BASE_URL:-/api}" \
  -e "VITE_SENTRY_DSN=${VITE_SENTRY_DSN:-}" \
  -e "VITE_ENABLE_MOCKS=${VITE_ENABLE_MOCKS:-true}" \
  "$TAG"
