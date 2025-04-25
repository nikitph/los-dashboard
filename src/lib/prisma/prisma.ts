import { PrismaClient } from "@prisma/client";
import { combineExtensions } from "@/lib/prisma/extensions";

// Attach Prisma Client to the global object in development to prevent multiple instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  }).$extends(combineExtensions());

// Ensure the Prisma Client is only instantiated once in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
