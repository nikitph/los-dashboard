import { Prisma } from "@prisma/client";

/**
 * Extension for the Prisma client that automatically creates an APPLICANT role for a user
 * when a new applicant record is created, if the role doesn't already exist.
 *
 * This ensures that every time an applicant record is created:
 * 1. The system checks if the user already has the APPLICANT role for that bank
 * 2. If not, the role is automatically created
 *
 * @returns A Prisma extension that can be applied to the Prisma client
 */
const applicantExtension = Prisma.defineExtension((prisma) => {
  return prisma.$extends({
    query: {
      applicant: {
        /**
         * Extends the applicant.create operation to automatically create an APPLICANT user role
         *
         * @param args - The original arguments passed to applicant.create
         * @param query - The original query function
         * @returns The created applicant record
         * @throws Error if the applicant record is missing userId or bankId
         */
        create: async ({ args, query }) => {
          console.log("🔄 Applicant extension: Starting create operation", {
            userId: args.data.userId,
            bankId: args.data.bankId,
          });

          /* First, execute the original query to create the applicant */
          const applicant = await query(args);

          console.log("✅ Applicant created successfully", {
            id: applicant.id,
            userId: applicant.userId,
            bankId: applicant.bankId,
          });

          /* This should not happen but TS requires it */
          if (!applicant.userId || !applicant.bankId) {
            console.error("❌ Error: Missing userId or bankId on applicant", applicant);
            throw new Error("Missing userId or bankId on applicant");
          }

          /* Check if the user already has the APPLICANT role for this bank */
          console.log("🔍 Checking for existing APPLICANT role", {
            userId: applicant.userId,
            bankId: applicant.bankId,
          });

          const existingRole = await prisma.userRoles.findFirst({
            where: {
              userId: applicant.userId,
              role: "APPLICANT",
              bankId: applicant.bankId,
              deletedAt: null,
            },
          });

          console.log("🔍 Existing role check complete", {
            exists: !!existingRole,
            roleId: existingRole?.id,
          });

          if (!existingRole) {
            console.log("➕ Creating new APPLICANT role", {
              userId: applicant.userId,
              bankId: applicant.bankId,
            });

            try {
              const userRole = await prisma.userRoles.create({
                data: {
                  userId: applicant.userId,
                  role: "APPLICANT",
                  bankId: applicant.bankId,
                },
              });

              console.log("✅ APPLICANT role created successfully", {
                roleId: userRole.id,
                userId: userRole.userId,
                bankId: userRole.bankId,
              });
            } catch (error) {
              console.error("❌ Failed to create APPLICANT role", {
                error,
                userId: applicant.userId,
                bankId: applicant.bankId,
              });
              // Not throwing the error to avoid affecting the main operation
            }
          } else {
            console.log("ℹ️ APPLICANT role already exists, skipping creation");
          }

          console.log("🏁 Applicant extension completed");
          return applicant;
        },
      },
    },
  });
});

export default applicantExtension;
