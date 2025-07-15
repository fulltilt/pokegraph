# Use a Node base image
FROM oven/bun:1

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN bun install

# Copy the rest of the app (used during initial build; overridden by volume in dev)
COPY . .

# Expose Vite's default dev port
EXPOSE 5173

# Run Vite dev server
CMD ["bun", "run", "dev"]

