-- CreateEnum
CREATE TYPE "SeparatorType" AS ENUM ('HYPHEN', 'SLASH', 'UNDERSCORE', 'DOT', 'NONE');

-- Step 1: Add the new column as NULLABLE first
ALTER TABLE "LoanApplication"
    ADD COLUMN "loanApplicationNumber" TEXT;

-- Step 2: Backfill the value using the id
UPDATE "LoanApplication"
SET "loanApplicationNumber" = id;

-- Step 3: Now make it NOT NULL
ALTER TABLE "LoanApplication"
    ALTER COLUMN "loanApplicationNumber" SET NOT NULL;

-- CreateTable
CREATE TABLE "ApplicationNumberConfiguration" (
                                                  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                                                  "bankId" TEXT NOT NULL,
                                                  "separator" "SeparatorType" NOT NULL,
                                                  "includePrefix" BOOLEAN NOT NULL DEFAULT false,
                                                  "includeBranch" BOOLEAN NOT NULL DEFAULT false,
                                                  "includeLoanType" BOOLEAN NOT NULL DEFAULT false,
                                                  "includeDate" BOOLEAN NOT NULL DEFAULT false,
                                                  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                  "updatedAt" TIMESTAMP(3) NOT NULL,

                                                  CONSTRAINT "ApplicationNumberConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationNumberConfiguration_bankId_key"
    ON "ApplicationNumberConfiguration"("bankId");

-- AddForeignKey
ALTER TABLE "ApplicationNumberConfiguration"
    ADD CONSTRAINT "ApplicationNumberConfiguration_bankId_fkey"
        FOREIGN KEY ("bankId") REFERENCES "Bank"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
