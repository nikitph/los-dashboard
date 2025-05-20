-- CreateEnum
CREATE TYPE "ReviewEntityType" AS ENUM ('APPLICANT', 'LOAN_APPLICATION', 'DOCUMENT', 'VERIFICATION');

-- CreateEnum
CREATE TYPE "ReviewEventType" AS ENUM ('CLERK_REVIEW', 'VERIFICATION_OFFICER_REVIEW', 'LOAN_OFFICER_REVIEW', 'CEO_REVIEW', 'LOAN_COMMITTEE_REVIEW', 'BOARD_REVIEW', 'BANK_ADMIN_REVIEW');

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "reviewEntityType" "ReviewEntityType" NOT NULL,
    "reviewEntityId" TEXT NOT NULL,
    "reviewEventType" "ReviewEventType" NOT NULL,
    "actionData" JSONB,
    "remarks" TEXT,
    "result" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userName" TEXT NOT NULL,
    "role" "RoleType" NOT NULL,
    "userId" TEXT NOT NULL,
    "loanApplicationId" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("authId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_loanApplicationId_fkey" FOREIGN KEY ("loanApplicationId") REFERENCES "LoanApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
