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

# Generate Prisma client
RUN bun run db:generate

# Skip building - run from TypeScript source in development
EXPOSE 3458

CMD ["bun", "run", "dev:mcp"]