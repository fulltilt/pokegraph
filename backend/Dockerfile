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
FROM oven/bun:1

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
# Install OpenSSL (required by Prisma engines on Linux)
# -----------------------------------------------------------------------------
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------------------
# Install dependencies at the workspace root
# -----------------------------------------------------------------------------
# This enables hoisting and correct workspace linking.
RUN bun install

# -----------------------------------------------------------------------------
# Generate Prisma client at build-time
# -----------------------------------------------------------------------------
# Required to avoid:
#   "@prisma/client did not initialize yet"
RUN bunx prisma generate --schema=/app/shared/prisma/schema.prisma

# verify prisma client exists
RUN ls -la /app/node_modules/.prisma/client || true
RUN ls -la /app/node_modules/@prisma/client || true

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
# CMD ["bun", "run", "start"]
CMD ["bun", "dist/index.js"]
