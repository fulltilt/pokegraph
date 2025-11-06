FROM oven/bun:latest

WORKDIR /app

# Copy workspace configuration files first
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY mcp/package*.json ./mcp/
COPY shared/package*.json ./shared/

# Copy all workspace source code needed for dependencies
COPY backend/ ./backend/
COPY mcp/ ./mcp/
COPY shared/ ./shared/

# Install all workspace dependencies
RUN bun install

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Generate Prisma client (run from backend, but using shared schema)
WORKDIR /app/backend
RUN bunx prisma generate --schema=../shared/prisma/schema.prisma

# Return to backend
WORKDIR /app/backend

# Skip building - run from TypeScript source in development
EXPOSE 3457