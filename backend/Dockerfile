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
EXPOSE 3457

CMD ["bun", "run", "dev:backend"]