# Use a base Node.js image
FROM oven/bun:1

# Set the working directory in the container
WORKDIR /app

# Copy only the package files to install dependencies
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN bun install

# Copy the rest of the code
COPY . .

# Expose a port if needed (optional)
EXPOSE 3457

# Start the dev server with live reload
CMD ["bun", "run", "dev"]

