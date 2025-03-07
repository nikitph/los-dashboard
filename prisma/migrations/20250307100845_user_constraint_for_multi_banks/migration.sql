-- CreateIndex
CREATE INDEX "UserRoles_userId_idx" ON "UserRoles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoles_userId_role_bankId_key" ON "UserRoles"("userId", "role", "bankId");

-- Add the check constraint using raw SQL
ALTER TABLE "UserRoles" ADD CONSTRAINT "bank_staff_single_bank_check"
    CHECK (
        "role" NOT IN ('CLERK', 'INSPECTOR', 'LOAN_OFFICER', 'CEO', 'LOAN_COMMITTEE', 'BOARD', 'BANK_ADMIN')
            OR NOT EXISTS (
            SELECT 1 FROM "UserRoles" AS ur
            WHERE ur."userId" = "UserRoles"."userId"
              AND ur."role" IN ('CLERK', 'INSPECTOR', 'LOAN_OFFICER', 'CEO', 'LOAN_COMMITTEE', 'BOARD', 'BANK_ADMIN')
              AND ur."deletedAt" IS NULL
              AND (ur."bankId" IS DISTINCT FROM "UserRoles"."bankId")
        )
        );
