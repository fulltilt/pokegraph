import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
export { PrismaClient };

// Export all database functions
export * from "./db";
