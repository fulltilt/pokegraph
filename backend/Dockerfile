# # Use a base Node.js image
# FROM oven/bun:1

# # Set the working directory in the container
# WORKDIR /app

# # Copy only the package files to install dependencies
# COPY package*.json ./

# # Install dependencies (including devDependencies)
# RUN bun install

# # Copy the rest of the code
# COPY . .

# # Expose a port if needed (optional)
# EXPOSE 3457

# # Start the dev server with live reload
# CMD ["bun", "run", "dev"]

FROM oven/bun:latest

WORKDIR /app

# Install OpenSSL AND npm for Prisma
# RUN apt-get update && \
#     apt-get install -y openssl npm && \
#     rm -rf /var/lib/apt/lists/*
RUN apt-get update && \
    apt-get install -y \
        openssl npm \
        libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy root package.json but we'll handle workspaces manually
COPY package*.json bun.lockb* ./

# Copy only the workspaces that exist in this build context
COPY backend/package*.json ./backend/
COPY mcp/package*.json ./mcp/
COPY shared/package*.json ./shared/
COPY scripts/package*.json ./scripts/
# Don't copy frontend - it's not in this context

COPY shared/prisma ./shared/prisma

# Temporarily remove frontend from workspaces for Docker build
RUN sed -i 's/"frontend",//g' package.json || true

# Install all workspace dependencies from root
RUN bun install

# Generate Prisma client
RUN bun run db:generate

# # Copy all workspace source code
# COPY backend/ ./backend/
# COPY mcp/ ./mcp/
# COPY shared/ ./shared/
# COPY scripts/ ./scripts/

# Copy only source code (not node_modules)
COPY backend/src ./backend/src
COPY backend/tsconfig.json ./backend/
COPY mcp/src ./mcp/src
COPY mcp/tsconfig.json ./mcp/
COPY shared/types.ts ./shared/
COPY scripts/src ./scripts/src

# Skip building - run from TypeScript source in development
EXPOSE 3457

# CMD ["bun", "run", "dev:backend"]