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
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy root package.json for workspace
COPY package.json bun.lockb* ./

# Copy shared folder (in case frontend needs types/utils from shared)
COPY shared ./shared

# Copy frontend
COPY frontend ./frontend

WORKDIR /app/frontend

# Install all dependencies
RUN bun install

# Build for production
RUN bun run build

# Production stage
FROM oven/bun:1

WORKDIR /app/frontend

# Copy built files
COPY --from=builder /app/frontend/dist ./dist
COPY --from=builder /app/frontend/package.json ./package.json

# Install minimal dependencies for serving
RUN bun install --production

EXPOSE 5173

# Serve the built files
CMD ["bunx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]