FROM oven/bun:latest

WORKDIR /app

# Copy necessary files
COPY package.json bun.lockb* ./
COPY shared ./shared
COPY backend ./backend
COPY frontend ./frontend
COPY scripts ./scripts

# Install dependencies
RUN bun install

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Generate Prisma client
RUN bunx prisma generate --schema=./shared/prisma/schema.prisma

WORKDIR /app

# The command will be specified in the CronJob
CMD ["bun", "run", "scripts/src/tcgp.ts"]