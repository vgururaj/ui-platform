# syntax=docker/dockerfile:1

# --- build once (no per-env bake) ---
FROM node:20-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY packages ./packages
COPY apps/demo ./apps/demo
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile \
  && pnpm --filter @vgururaj/demo... build \
  && rm -rf node_modules apps/demo/node_modules packages/*/node_modules /root/.local /tmp/*

# --- run: same image for every env; config from container env at start ---
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 deploy/10-runtime-env.sh /docker-entrypoint.d/10-runtime-env.sh
COPY --from=build --chown=nginx:nginx /app/apps/demo/dist /usr/share/nginx/html

EXPOSE 8080
# Base image ENTRYPOINT runs /docker-entrypoint.d/* then nginx as USER nginx
