#!/usr/bin/env sh
# Build the demo image once (no per-env build-args). Config is injected at run time.
set -eu
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TAG="${DOCKER_IMAGE_TAG:-ui-platform-demo:local}"
docker build -t "$TAG" .
