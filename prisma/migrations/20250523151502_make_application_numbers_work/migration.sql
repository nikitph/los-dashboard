-- DropIndex
DROP INDEX "ApplicationNumberSequence_bankId_sequenceType_key";

-- Drop and recreate the trigger function with proper timestamp handling
DROP TRIGGER IF EXISTS trigger_auto_generate_app_number ON "LoanApplication";
DROP FUNCTION IF EXISTS auto_generate_application_number();

-- Create the corrected trigger function
CREATE OR REPLACE FUNCTION auto_generate_application_number()
    RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if loanApplicationNumber is null or empty
    IF NEW."loanApplicationNumber" IS NULL OR NEW."loanApplicationNumber" = '' THEN
        NEW."loanApplicationNumber" := generate_application_number(
                NEW."bankId",
                NEW."loanType"::TEXT
                                       );
    END IF;

    -- Don't modify updatedAt here - let Prisma handle it
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_auto_generate_app_number
    BEFORE INSERT ON "LoanApplication"
    FOR EACH ROW
EXECUTE FUNCTION auto_generate_application_number();

-- Also fix the sequence update function to use proper timestamp
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
        "updatedAt" = CURRENT_TIMESTAMP  -- Use CURRENT_TIMESTAMP instead of NOW()
    WHERE "bankId" = p_bank_id AND "sequenceType" = p_sequence_type
    RETURNING "currentNumber" INTO next_num;

    IF next_num IS NULL THEN
        INSERT INTO "ApplicationNumberSequence" ("bankId", "sequenceType", "currentNumber", "updatedAt")
        VALUES (p_bank_id, p_sequence_type, 1, CURRENT_TIMESTAMP)
        ON CONFLICT ("bankId", "sequenceType")
            DO UPDATE SET
                          "currentNumber" = "ApplicationNumberSequence"."currentNumber" + 1,
                          "updatedAt" = CURRENT_TIMESTAMP
        RETURNING "currentNumber" INTO next_num;
    END IF;

    RETURN next_num;
END;
$$ LANGUAGE plpgsql;
