# FROM oven/bun:latest

# WORKDIR /app

# # Copy workspace configuration files first
# COPY package.json ./
# COPY shared ./shared
# COPY backend ./backend

# # Install all workspace dependencies
# RUN bun install

# # Install OpenSSL for Prisma
# RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# RUN bunx prisma generate --schema=shared/prisma/schema.prisma

# # Copy trained model files
# # COPY scripts/python/sealed_classifier_service/model /app/trainer/model

# WORKDIR /app/backend
# EXPOSE 3457

# # this line can be overridden in docker-compose.yml. This is here if you want to run the backend container standalone.
# CMD ["bun", "run", "dev"]


FROM oven/bun:latest
# -----------------------------------------------------------------------------
# Backend production image for Kubernetes (Bun + Prisma + built dist/)
# -----------------------------------------------------------------------------
# Goal:
# - Immutable runtime: no installs, no generates, no watchers at container start
# - Deterministic: deps + prisma client + dist built during image build
# - K8s-friendly: single foreground process, fast startup, stable behavior
#
# This uses a single-stage build for simplicity.
# If you want a smaller image, we can convert this to a multi-stage build later.
# -----------------------------------------------------------------------------
FROM oven/bun:latest

WORKDIR /app

# -----------------------------------------------------------------------------
# Copy workspace root manifests first (cache-friendly layer)
# -----------------------------------------------------------------------------
COPY package.json ./
COPY bun.lockb* ./

# -----------------------------------------------------------------------------
# Copy ALL workspaces referenced by root package.json
# -----------------------------------------------------------------------------
# Bun validates workspace existence during bun install.
# Even if backend doesn't "use" frontend at runtime, the folder must exist here.
COPY shared ./shared
COPY backend ./backend
COPY frontend ./frontend

# -----------------------------------------------------------------------------
# Install dependencies at the workspace root
# -----------------------------------------------------------------------------
# This enables hoisting and correct workspace linking.
RUN bun install

# -----------------------------------------------------------------------------
# Install OpenSSL (required by Prisma engines on Linux)
# -----------------------------------------------------------------------------
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------------------
# Generate Prisma client at build-time
# -----------------------------------------------------------------------------
# Required to avoid:
#   "@prisma/client did not initialize yet"
RUN bunx prisma generate --schema=shared/prisma/schema.prisma

# -----------------------------------------------------------------------------
# Build backend into dist/
# -----------------------------------------------------------------------------
# Uses your backend script:
#   bun build src/index.ts --outdir dist --target node
WORKDIR /app/backend
RUN bun run build

# -----------------------------------------------------------------------------
# Expose backend port
# -----------------------------------------------------------------------------
EXPOSE 3457

# -----------------------------------------------------------------------------
# Production start
# -----------------------------------------------------------------------------
# Your backend/package.json defines:
#   "start": "bun dist/index.js"
# This is correct for k8s (no watcher).
CMD ["bun", "run", "start"]
