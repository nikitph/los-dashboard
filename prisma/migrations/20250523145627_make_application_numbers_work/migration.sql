/*
  Warnings:

  - You are about to drop the column `bank_id` on the `ApplicationNumberSequence` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `ApplicationNumberSequence` table. All the data in the column will be lost.
  - You are about to drop the column `current_number` on the `ApplicationNumberSequence` table. All the data in the column will be lost.
  - You are about to drop the column `sequence_type` on the `ApplicationNumberSequence` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `ApplicationNumberSequence` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bankId,sequenceType]` on the table `ApplicationNumberSequence` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bankId` to the `ApplicationNumberSequence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ApplicationNumberSequence` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApplicationNumberSequence" DROP CONSTRAINT "ApplicationNumberSequence_bank_id_fkey";

-- DropIndex
DROP INDEX "ApplicationNumberSequence_bank_id_key";

-- DropIndex
DROP INDEX "ApplicationNumberSequence_bank_id_sequence_type_idx";

-- DropIndex
DROP INDEX "ApplicationNumberSequence_bank_id_sequence_type_key";

-- AlterTable
ALTER TABLE "ApplicationNumberSequence" DROP COLUMN "bank_id",
                                        DROP COLUMN "created_at",
                                        DROP COLUMN "current_number",
                                        DROP COLUMN "sequence_type",
                                        DROP COLUMN "updated_at",
                                        ADD COLUMN     "bankId" TEXT NOT NULL,
                                        ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        ADD COLUMN     "currentNumber" BIGINT NOT NULL DEFAULT 0,
                                        ADD COLUMN     "sequenceType" TEXT NOT NULL DEFAULT 'default',
                                        ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex - CORRECTED: Only create the composite unique index, not the single bankId one
CREATE INDEX "ApplicationNumberSequence_bankId_sequenceType_idx" ON "ApplicationNumberSequence"("bankId", "sequenceType");

-- CreateIndex - This is the correct unique constraint
CREATE UNIQUE INDEX "ApplicationNumberSequence_bankId_sequenceType_key" ON "ApplicationNumberSequence"("bankId", "sequenceType");

-- AddForeignKey
ALTER TABLE "ApplicationNumberSequence" ADD CONSTRAINT "ApplicationNumberSequence_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 1. Create function to get next sequential number (thread-safe)
CREATE OR REPLACE FUNCTION get_next_application_number(
    p_bank_id TEXT,
    p_sequence_type TEXT DEFAULT 'default'
) RETURNS BIGINT AS $$
DECLARE
    next_num BIGINT;
BEGIN
    UPDATE "ApplicationNumberSequence"
    SET
        "currentNumber" = "currentNumber" + 1,
        "updatedAt" = NOW()
    WHERE "bankId" = p_bank_id AND "sequenceType" = p_sequence_type
    RETURNING "currentNumber" INTO next_num;

    IF next_num IS NULL THEN
        INSERT INTO "ApplicationNumberSequence" ("bankId", "sequenceType", "currentNumber")
        VALUES (p_bank_id, p_sequence_type, 1)
        ON CONFLICT ("bankId", "sequenceType")
            DO UPDATE SET
                          "currentNumber" = "ApplicationNumberSequence"."currentNumber" + 1,
                          "updatedAt" = NOW()
        RETURNING "currentNumber" INTO next_num;
    END IF;

    RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- 2. Create function to generate formatted application numbers
CREATE OR REPLACE FUNCTION generate_application_number(
    p_bank_id TEXT,
    p_loan_type TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    config RECORD;
    next_num BIGINT;
    app_number TEXT := '';
    date_part TEXT;
    separator_char TEXT;
    loan_type_code TEXT;
BEGIN
    SELECT
        anc."id",
        anc."bankId",
        anc."bankName",
        anc."branchNumber",
        anc."loanTypeCode",
        anc."serialNumberPadding",
        anc."separator",
        anc."includePrefix",
        anc."includeBranch",
        anc."includeLoanType",
        anc."includeDate",
        b."name" as bank_name
    INTO config
    FROM "ApplicationNumberConfiguration" anc
             JOIN "Bank" b ON b.id = anc."bankId"
    WHERE anc."bankId" = p_bank_id;

    next_num := get_next_application_number(p_bank_id);

    IF config IS NULL THEN
        RETURN LPAD(next_num::TEXT, 5, '0');
    END IF;

    separator_char := CASE config."separator"
                          WHEN 'HYPHEN' THEN '-'
                          WHEN 'SLASH' THEN '/'
                          WHEN 'UNDERSCORE' THEN '_'
                          WHEN 'DOT' THEN '.'
                          WHEN 'NONE' THEN ''
                          ELSE '-'
        END;

    loan_type_code := CASE p_loan_type
                          WHEN 'PERSONAL' THEN 'PL'
                          WHEN 'VEHICLE' THEN 'VL'
                          WHEN 'HOUSE_CONSTRUCTION' THEN 'HC'
                          WHEN 'PLOT_AND_HOUSE_CONSTRUCTION' THEN 'PHC'
                          WHEN 'PLOT_PURCHASE' THEN 'PP'
                          WHEN 'MORTGAGE' THEN 'ML'
                          ELSE config."loanTypeCode"
        END;

    IF config."includePrefix" = true AND config.bank_name IS NOT NULL THEN
        app_number := app_number || UPPER(LEFT(config.bank_name, 3));
        IF separator_char != '' THEN
            app_number := app_number || separator_char;
        END IF;
    END IF;

    IF config."includeBranch" = true AND config."branchNumber" IS NOT NULL THEN
        app_number := app_number || config."branchNumber";
        IF separator_char != '' THEN
            app_number := app_number || separator_char;
        END IF;
    END IF;

    IF config."includeLoanType" = true AND loan_type_code IS NOT NULL THEN
        app_number := app_number || loan_type_code;
        IF separator_char != '' THEN
            app_number := app_number || separator_char;
        END IF;
    END IF;

    IF config."includeDate" = true THEN
        date_part := TO_CHAR(CURRENT_DATE, 'DDMMYY');
        app_number := app_number || date_part;
        IF separator_char != '' THEN
            app_number := app_number || separator_char;
        END IF;
    END IF;

    app_number := app_number || LPAD(next_num::TEXT, COALESCE(config."serialNumberPadding", 5), '0');

    RETURN app_number;
END;
$$ LANGUAGE plpgsql;

-- 3. Create unique index on loanApplicationNumber
CREATE UNIQUE INDEX IF NOT EXISTS "idx_loan_app_number_unique"
    ON "LoanApplication"("loanApplicationNumber")
    WHERE "loanApplicationNumber" IS NOT NULL;

-- 4. Create trigger function for auto-generation
CREATE OR REPLACE FUNCTION auto_generate_application_number()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW."loanApplicationNumber" IS NULL OR NEW."loanApplicationNumber" = '' THEN
        NEW."loanApplicationNumber" := generate_application_number(
                NEW."bankId",
                NEW."loanType"::TEXT
                                       );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_app_number ON "LoanApplication";
CREATE TRIGGER trigger_auto_generate_app_number
    BEFORE INSERT ON "LoanApplication"
    FOR EACH ROW
EXECUTE FUNCTION auto_generate_application_number();

-- 6. Utility functions for management
CREATE OR REPLACE FUNCTION reset_bank_sequence(
    p_bank_id TEXT,
    p_new_start BIGINT DEFAULT 1
) RETURNS VOID AS $$
BEGIN
    UPDATE "ApplicationNumberSequence"
    SET "currentNumber" = p_new_start - 1
    WHERE "bankId" = p_bank_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_current_sequence_value(p_bank_id TEXT)
    RETURNS BIGINT AS $$
DECLARE
    current_val BIGINT;
BEGIN
    SELECT "currentNumber" INTO current_val
    FROM "ApplicationNumberSequence"
    WHERE "bankId" = p_bank_id;

    RETURN COALESCE(current_val, 0);
END;
$$ LANGUAGE plpgsql;
