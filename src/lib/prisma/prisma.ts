import { PrismaClient } from "@prisma/client";

// Attach Prisma Client to the global object in development to prevent multiple instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"], // Optional: Log SQL queries, errors, and warnings
  });

// Ensure the Prisma Client is only instantiated once in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
