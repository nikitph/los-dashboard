import { Prisma } from "@prisma/client";
import applicantExtension from "./applicant";

/**
 * Combines multiple Prisma extensions into a single extension.
 *
 * This function creates a unified Prisma extension that applies all individual
 * model-specific extensions in sequence. Currently includes:
 * - applicantExtension: Automatically creates UserRoles records when Applicant records are created
 *
 * Using this combined approach allows for:
 * - Cleaner Prisma client instantiation
 * - Easier addition of new extensions
 * - Better organization of extension logic by domain model
 *
 * @returns {Prisma.Extensions.Args} A combined Prisma extension that can be applied with prisma.$extends()
 *
 * @example
 * // In prisma/index.ts
 * import { PrismaClient } from '@prisma/client'
 * import { combineExtensions } from './extensions'
 *
 * const prisma = new PrismaClient().$extends(combineExtensions())
 * export { prisma }
 */
export const combineExtensions = () => {
  return Prisma.defineExtension((client) => {
    // Start with the base client
    let extendedClient = client;

    // Apply each extension in sequence
    // Order can matter if extensions modify the same operations
    extendedClient = extendedClient.$extends(applicantExtension);

    // Return the fully extended client
    return extendedClient;
  });
};
