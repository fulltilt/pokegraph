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

# Generate Prisma client in shared workspace
WORKDIR /app/shared
RUN bunx prisma generate --schema=prisma/schema.prisma

# Return to app root
WORKDIR /app

# Skip building - run from TypeScript source in development
EXPOSE 3457