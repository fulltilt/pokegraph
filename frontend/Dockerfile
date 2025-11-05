# Use a Node base image
FROM oven/bun:1

# Set the working directory
WORKDIR /app/frontend

# Copy frontend package.json (not root package.json)
COPY frontend/package*.json ./

# Install dependencies
RUN bun install

# Remove potential conflicts before copying app files
RUN rm -rf node_modules

# Copy the rest of the frontend app
COPY frontend/ .

# Expose Vite's default dev port
EXPOSE 5173

# Run Vite dev server
CMD ["bun", "run", "dev"]