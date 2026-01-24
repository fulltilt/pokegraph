# # Use a Node base image
# FROM oven/bun:1

# # Set the working directory
# WORKDIR /app/frontend

# # Copy frontend package.json (not root package.json)
# COPY frontend/package*.json ./

# # Install dependencies
# RUN bun install

# # Copy the rest of the frontend app
# COPY frontend/ .

# # Expose Vite's default dev port
# EXPOSE 5173

# # Run Vite dev server
# CMD ["bun", "run", "dev"]




# -----------------------------------------------------------------------------
# Frontend production image for Kubernetes (Build with Bun, Serve with Nginx)
# -----------------------------------------------------------------------------
# Stage 1 builds the Vite app into /dist
# Stage 2 serves the static files with nginx
#
# Benefits for k8s:
# - Small runtime image (nginx:alpine)
# - No node_modules at runtime
# - Deterministic build artifacts
# -----------------------------------------------------------------------------

# -----------------------------------------------------------------------------
# Stage 1: Builder
# -----------------------------------------------------------------------------
FROM oven/bun:1 AS builder

WORKDIR /app

# Build-time env injection (baked into Vite build output)
ARG VITE_ENDPOINT_URL
ENV VITE_ENDPOINT_URL=$VITE_ENDPOINT_URL

# Copy workspace manifests first for caching
COPY package.json bun.lockb* ./

# shared is included because frontend imports from it (types/utils)
COPY shared ./shared

# copy frontend source
COPY frontend ./frontend

# Move into frontend workspace
WORKDIR /app/frontend

# Install deps (in this workspace context)
# If you ever hit workspace resolution issues, switch to root install:
#   WORKDIR /app && RUN bun install && WORKDIR /app/frontend
RUN bun install

# Build Vite production assets
RUN bun run build

# -----------------------------------------------------------------------------
# Stage 2: Runtime
# -----------------------------------------------------------------------------
FROM nginx:alpine

# Copy built assets into nginx html directory
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# SPA-friendly nginx config (try_files -> index.html)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Foreground process required for containers
CMD ["nginx", "-g", "daemon off;"]
