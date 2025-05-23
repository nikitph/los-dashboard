-- ============================================================================
-- COMPLETE APPLICATION NUMBER SYSTEM SETUP
-- Run this entire script to set up sequential loanApplicationNumbers
-- ============================================================================

-- 1. Create the sequence counter table
CREATE TABLE IF NOT EXISTS application_number_sequences (
                                                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                            bank_id TEXT REFERENCES "Bank"(id) ON DELETE CASCADE,
                                                            sequence_type TEXT NOT NULL DEFAULT 'default',
                                                            current_number BIGINT NOT NULL DEFAULT 0,
                                                            prefix TEXT,
                                                            created_at TIMESTAMPTZ DEFAULT NOW(),
                                                            updated_at TIMESTAMPTZ DEFAULT NOW(),

                                                            UNIQUE(bank_id, sequence_type)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_num_seq_bank_type ON application_number_sequences(bank_id, sequence_type);

-- 3. Create function to get next sequential number (thread-safe)
CREATE OR REPLACE FUNCTION get_next_application_number(
    p_bank_id UUID,
    p_sequence_type TEXT DEFAULT 'default'
) RETURNS BIGINT AS $$
DECLARE
    next_num BIGINT;
BEGIN
    UPDATE application_number_sequences
    SET
        current_number = current_number + 1,
        updated_at = NOW()
    WHERE bank_id = p_bank_id AND sequence_type = p_sequence_type
    RETURNING current_number INTO next_num;

    IF next_num IS NULL THEN
        INSERT INTO application_number_sequences (bank_id, sequence_type, current_number)
        VALUES (p_bank_id, p_sequence_type, 1)
        ON CONFLICT (bank_id, sequence_type)
            DO UPDATE SET
                          current_number = application_number_sequences.current_number + 1,
                          updated_at = NOW()
        RETURNING current_number INTO next_num;
    END IF;

    RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to generate formatted application numbers
CREATE OR REPLACE FUNCTION generate_application_number(
    p_bank_id UUID,
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
        anc.*,
        b.name as bank_name
    INTO config
    FROM "ApplicationNumberConfiguration" anc
             JOIN "Bank" b ON b.id = anc.bank_id
    WHERE anc.bank_id = p_bank_id;

    next_num := get_next_application_number(p_bank_id);

    IF config IS NULL THEN
        RETURN LPAD(next_num::TEXT, 5, '0');
    END IF;

    separator_char := CASE config.separator
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
                          ELSE config.loan_type_code
        END;

    IF config.include_prefix AND config.bank_name IS NOT NULL THEN
        app_number := app_number || UPPER(LEFT(config.bank_name, 3));
        IF separator_char != '' THEN
            app_number := app_number || separator_char;
        END IF;
    END IF;

    IF config.include_branch AND config.branch_number IS NOT NULL THEN
        app_number := app_number || config.branch_number;
        IF separator_char != '' THEN
            app_number := app_number || separator_char;
        END IF;
    END IF;

    IF config.include_loan_type AND loan_type_code IS NOT NULL THEN
        app_number := app_number || loan_type_code;
        IF separator_char != '' THEN
            app_number := app_number || separator_char;
        END IF;
    END IF;

    IF config.include_date THEN
        date_part := TO_CHAR(CURRENT_DATE, 'DDMMYY');
        app_number := app_number || date_part;
        IF separator_char != '' THEN
            app_number := app_number || separator_char;
        END IF;
    END IF;

    app_number := app_number || LPAD(next_num::TEXT, COALESCE(config.serial_number_padding, 5), '0');

    RETURN app_number;
END;
$$ LANGUAGE plpgsql;

-- 5. Add loanApplicationNumber column to LoanApplication
ALTER TABLE "LoanApplication"
    ADD COLUMN IF NOT EXISTS "loanApplicationNumber" TEXT;

-- 6. Create unique index to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_loan_app_number_unique
    ON "LoanApplication"("loanApplicationNumber")
    WHERE "loanApplicationNumber" IS NOT NULL;

-- 7. Create trigger function for auto-generation
CREATE OR REPLACE FUNCTION auto_generate_application_number()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW."loanApplicationNumber" IS NULL OR NEW."loanApplicationNumber" = '' THEN
        NEW."loanApplicationNumber" := generate_application_number(
                NEW.bank_id,
                NEW.loan_type::TEXT
                                       );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_app_number ON "LoanApplication";
CREATE TRIGGER trigger_auto_generate_app_number
    BEFORE INSERT ON "LoanApplication"
    FOR EACH ROW
EXECUTE FUNCTION auto_generate_application_number();

-- 9. Utility functions for management
CREATE OR REPLACE FUNCTION reset_bank_sequence(
    p_bank_id UUID,
    p_new_start BIGINT DEFAULT 1
) RETURNS VOID AS $$
BEGIN
    UPDATE application_number_sequences
    SET current_number = p_new_start - 1
    WHERE bank_id = p_bank_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_current_sequence_value(p_bank_id UUID)
    RETURNS BIGINT AS $$
DECLARE
    current_val BIGINT;
BEGIN
    SELECT current_number INTO current_val
    FROM application_number_sequences
    WHERE bank_id = p_bank_id;

    RETURN COALESCE(current_val, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT 'Tables created' as status WHERE EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'application_number_sequences'
);

SELECT 'Functions created' as status WHERE EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'generate_application_number'
);

SELECT 'Trigger created' as status WHERE EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trigger_auto_generate_app_number'
);
