/*
  Warnings:

  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Applicant"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Bank"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "BankConfiguration"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Dependent"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Document"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Income"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "IncomeDetail"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LoanApplication"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LoanObligation"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LoanObligationDetail"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Subscription"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserProfile"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserRoles"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Verification"
    ADD COLUMN "deletedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "Permission";

-- Insert Trigger with Error Handling
CREATE
OR REPLACE FUNCTION log_insert() RETURNS TRIGGER AS $$
BEGIN
BEGIN
INSERT INTO "AuditLog" (id, action, tableName, recordId, userId, newData, timestamp)
VALUES (gen_random_uuid(),
        'INSERT',
        TG_TABLE_NAME,
        NEW.id,
        auth.uid(),
        to_jsonb(NEW),
        now());
EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the transaction
        RAISE WARNING 'Error in log_insert trigger for table % : %', TG_TABLE_NAME, SQLERRM;
END;
RETURN NEW;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Update Trigger with Error Handling
CREATE
OR REPLACE FUNCTION log_update() RETURNS TRIGGER AS $$
BEGIN
BEGIN
INSERT INTO "AuditLog" (id, action, tableName, recordId, userId, oldData, newData, timestamp)
VALUES (gen_random_uuid(),
        'UPDATE',
        TG_TABLE_NAME,
        OLD.id,
        auth.uid(),
        to_jsonb(OLD),
        to_jsonb(NEW),
        now());
EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the transaction
        RAISE WARNING 'Error in log_update trigger for table % : %', TG_TABLE_NAME, SQLERRM;
END;
RETURN NEW;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Hard Delete Trigger with Error Handling
CREATE
OR REPLACE FUNCTION log_hard_delete() RETURNS TRIGGER AS $$
BEGIN
BEGIN
INSERT INTO "AuditLog" (id, action, tableName, recordId, userId, oldData, timestamp)
VALUES (gen_random_uuid(),
        'DELETE',
        TG_TABLE_NAME,
        OLD.id,
        auth.uid(),
        to_jsonb(OLD),
        now());
EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the transaction
        RAISE WARNING 'Error in log_hard_delete trigger for table % : %', TG_TABLE_NAME, SQLERRM;
END;
RETURN OLD;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Soft Delete Trigger with Error Handling
CREATE
OR REPLACE FUNCTION log_soft_delete() RETURNS TRIGGER AS $$
BEGIN
BEGIN
        IF
OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
            INSERT INTO "AuditLog" (id, action, tableName, recordId, userId, oldData, newData, timestamp)
            VALUES (
                gen_random_uuid(),
                'SOFT_DELETE',
                TG_TABLE_NAME,
                OLD.id,
                auth.uid(),
                to_jsonb(OLD),
                to_jsonb(NEW),
                now()
            );
END IF;
EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the transaction
        RAISE WARNING 'Error in log_soft_delete trigger for table % : %', TG_TABLE_NAME, SQLERRM;
END;
RETURN NEW;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Restore Trigger with Error Handling
CREATE
OR REPLACE FUNCTION log_restore() RETURNS TRIGGER AS $$
BEGIN
BEGIN
        IF
OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
            INSERT INTO "AuditLog" (id, action, tableName, recordId, userId, oldData, newData, timestamp)
            VALUES (
                gen_random_uuid(),
                'RESTORE',
                TG_TABLE_NAME,
                OLD.id,
                auth.uid(),
                to_jsonb(OLD),
                to_jsonb(NEW),
                now()
            );
END IF;
EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the transaction
        RAISE WARNING 'Error in log_restore trigger for table % : %', TG_TABLE_NAME, SQLERRM;
END;
RETURN NEW;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

CREATE
OR REPLACE FUNCTION log_soft_delete() RETURNS TRIGGER AS $$
BEGIN
  IF
OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    INSERT INTO "AuditLog" (id, action, tableName, recordId, userId, oldData, newData, timestamp)
    VALUES (
      gen_random_uuid(),
      'SOFT_DELETE',
      TG_TABLE_NAME,
      OLD.id,
      auth.uid(),
      to_jsonb(OLD),
      to_jsonb(NEW),
      now()
    );
END IF;
RETURN NEW;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

CREATE
OR REPLACE FUNCTION log_restore() RETURNS TRIGGER AS $$
BEGIN
  IF
OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
    INSERT INTO "AuditLog" (id, action, tableName, recordId, userId, oldData, newData, timestamp)
    VALUES (
      gen_random_uuid(),
      'RESTORE',
      TG_TABLE_NAME,
      OLD.id,
      auth.uid(),
      to_jsonb(OLD),
      to_jsonb(NEW),
      now()
    );
END IF;
RETURN NEW;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;
