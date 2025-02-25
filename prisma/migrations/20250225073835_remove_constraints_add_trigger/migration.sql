-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RoleType" ADD VALUE 'APPLICANT';
ALTER TYPE "RoleType" ADD VALUE 'USER';

-- AlterTable
ALTER TABLE "UserProfile"
    ALTER COLUMN "firstName" DROP NOT NULL,
ALTER
COLUMN "lastName" DROP
NOT NULL,
ALTER
COLUMN "phoneNumber" DROP
NOT NULL;

-- Add trigger
CREATE
OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the new user's ID
  -- Create a UserProfile entry
INSERT INTO public."UserProfile" ("authId",
                                  "firstName",
                                  "lastName",
                                  "email",
                                  "phoneNumber",
                                  "isOnboarded",
                                  "createdAt",
                                  "updatedAt")
VALUES (NEW.id,
        (NEW.raw_user_meta_data ->>'first_name'),
        (NEW.raw_user_meta_data ->>'last_name'),
        NEW.email,
        COALESCE(NEW.phone, (NEW.raw_user_meta_data ->>'phone_number')),
        FALSE,
        COALESCE(NEW.created_at, NOW()),
        NOW() -- Ensure updatedAt is set
       );

-- Create a UserRoles entry with the "USER" role
INSERT INTO public."UserRoles" ("userId",
                                "role")
VALUES (NEW.id,
        'USER');

RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Create a more descriptive error message
  RAISE EXCEPTION 'Failed to create user profile: % (Error code: %)',
    SQLERRM, SQLSTATE;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;
