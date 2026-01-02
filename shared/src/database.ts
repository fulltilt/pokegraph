import { PrismaClient, Prisma } from "@prisma/client";

export const prisma = new PrismaClient();
export { PrismaClient, Prisma };

// Export all database functions
export * from "./db";
