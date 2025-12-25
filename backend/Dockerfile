FROM oven/bun:latest

WORKDIR /app

# Copy workspace configuration files first
COPY package.json ./
COPY shared ./shared
COPY backend ./backend

# Install all workspace dependencies
RUN bun install

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN bunx prisma generate --schema=shared/prisma/schema.prisma

# Copy trained model files
#COPY scripts/python/sealed_classifier_service/model /app/trainer/model

WORKDIR /app/backend
EXPOSE 3457

# this line can be overridden in docker-compose.yml. This is here if you want to run the backend container standalone.
CMD ["bun", "run", "dev"]