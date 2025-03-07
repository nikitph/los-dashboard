-- CreateIndex
CREATE INDEX "UserRoles_userId_idx" ON "UserRoles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoles_userId_role_bankId_key" ON "UserRoles"("userId", "role", "bankId");

-- Add the check constraint using raw SQL
-- This function will run before insert or update operations on UserRoles
CREATE OR REPLACE FUNCTION check_user_bank_roles()
RETURNS TRIGGER AS $$
DECLARE
bank_staff_roles text[] := ARRAY['CLERK', 'INSPECTOR', 'LOAN_OFFICER', 'CEO', 'LOAN_COMMITTEE', 'BOARD', 'BANK_ADMIN'];
  conflicting_roles integer;
BEGIN
  -- Only check when role is a bank staff role
  IF NEW.role::text = ANY(bank_staff_roles) THEN
    -- Count conflicting roles (same user, bank staff role, different bank)
SELECT COUNT(*) INTO conflicting_roles
FROM "UserRoles"
WHERE "userId" = NEW."userId"
  AND "role"::text = ANY(bank_staff_roles)
      AND "deletedAt" IS NULL
      AND ("bankId" IS DISTINCT FROM NEW."bankId")
      AND id != NEW.id; -- Exclude the current record for updates

-- If any conflicts found, raise an exception
IF conflicting_roles > 0 THEN
      RAISE EXCEPTION 'User cannot hold bank staff roles in multiple banks';
END IF;
END IF;

  -- Ensure USER role has null bankId
  IF NEW.role = 'USER' AND NEW."bankId" IS NOT NULL THEN
    RAISE EXCEPTION 'USER role must have null bankId';
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that runs this check before INSERT or UPDATE
CREATE TRIGGER enforce_bank_staff_rule
    BEFORE INSERT OR UPDATE ON "UserRoles"
                         FOR EACH ROW
                         EXECUTE FUNCTION check_user_bank_roles();
