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

# Accept build arguments
ARG VITE_ENDPOINT_URL

# Set as environment variables for build
ENV VITE_ENDPOINT_URL=$VITE_ENDPOINT_URL

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

# Production stage - Use nginx to serve static files
FROM nginx:alpine

# Copy built files to nginx html directory
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]