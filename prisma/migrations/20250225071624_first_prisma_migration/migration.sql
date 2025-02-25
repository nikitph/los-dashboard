-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('CLERK', 'INSPECTOR', 'LOAN_OFFICER', 'CEO', 'LOAN_COMMITTEE', 'BOARD', 'BANK_ADMIN', 'SAAS_ADMIN');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('PERSONAL', 'VEHICLE', 'HOUSE_CONSTRUCTION', 'PLOT_PURCHASE', 'MORTGAGE');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('RESIDENCE', 'BUSINESS', 'VEHICLE', 'PROPERTY');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "UserProfile"
(
    "auth_id"     TEXT         NOT NULL DEFAULT gen_random_uuid(),
    "authId"      TEXT         NOT NULL,
    "firstName"   TEXT         NOT NULL,
    "lastName"    TEXT         NOT NULL,
    "email"       TEXT,
    "phoneNumber" TEXT         NOT NULL,
    "isOnboarded" BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("auth_id")
);

-- CreateTable
CREATE TABLE "UserRoles"
(
    "id"         TEXT         NOT NULL DEFAULT gen_random_uuid(),
    "userId"     TEXT         NOT NULL,
    "role"       "RoleType"   NOT NULL,
    "bankId"     TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant"
(
    "id"                       TEXT         NOT NULL DEFAULT gen_random_uuid(),
    "userId"                   TEXT         NOT NULL,
    "createdAt"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"                TIMESTAMP(3) NOT NULL,
    "dateOfBirth"              TIMESTAMP(3) NOT NULL,
    "addressState"             TEXT         NOT NULL,
    "addressCity"              TEXT         NOT NULL,
    "addressFull"              TEXT         NOT NULL,
    "addressPinCode"           TEXT         NOT NULL,
    "aadharNumber"             TEXT         NOT NULL,
    "panNumber"                TEXT         NOT NULL,
    "aadharVerificationStatus" BOOLEAN      NOT NULL DEFAULT false,
    "panVerificationStatus"    BOOLEAN      NOT NULL DEFAULT false,
    "photoUrl"                 TEXT         NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanObligation"
(
    "id"          TEXT         NOT NULL DEFAULT gen_random_uuid(),
    "applicantId" TEXT         NOT NULL,
    "cibilScore"  DOUBLE PRECISION,
    "totalLoan"   DOUBLE PRECISION,
    "totalEmi"    DOUBLE PRECISION,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanObligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanObligationDetail"
(
    "id"               TEXT             NOT NULL DEFAULT gen_random_uuid(),
    "loanObligationId" TEXT             NOT NULL,
    "outstandingLoan"  DOUBLE PRECISION NOT NULL,
    "emiAmount"        DOUBLE PRECISION NOT NULL,
    "loanDate"         TIMESTAMP(3)     NOT NULL,
    "loanType"         TEXT             NOT NULL,
    "bankName"         TEXT             NOT NULL,
    "createdAt"        TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "LoanObligationDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Income"
(
    "id"          TEXT         NOT NULL DEFAULT gen_random_uuid(),
    "applicantId" TEXT         NOT NULL,
    "type"        TEXT         NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeDetail"
(
    "id"                 TEXT         NOT NULL DEFAULT gen_random_uuid(),
    "incomeId"           TEXT         NOT NULL,
    "year"               INTEGER      NOT NULL,
    "taxableIncome"      DOUBLE PRECISION,
    "taxPaid"            DOUBLE PRECISION,
    "grossIncome"        DOUBLE PRECISION,
    "rentalIncome"       DOUBLE PRECISION,
    "incomeFromBusiness" DOUBLE PRECISION,
    "depreciation"       DOUBLE PRECISION,
    "grossCashIncome"    DOUBLE PRECISION,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomeDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dependent"
(
    "id"                        TEXT             NOT NULL DEFAULT gen_random_uuid(),
    "applicantId"               TEXT             NOT NULL,
    "averageMonthlyExpenditure" DOUBLE PRECISION NOT NULL,
    "createdAt"                 TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"                 TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "Dependent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission"
(
    "id"       TEXT       NOT NULL DEFAULT gen_random_uuid(),
    "action"   TEXT       NOT NULL,
    "resource" TEXT       NOT NULL,
    "role"     "RoleType" NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bank"
(
    "id"        TEXT         NOT NULL DEFAULT gen_random_uuid(),
    "name"      TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription"
(
    "id"        TEXT             NOT NULL DEFAULT gen_random_uuid(),
    "bankId"    TEXT             NOT NULL,
    "startDate" TIMESTAMP(3)     NOT NULL,
    "endDate"   TIMESTAMP(3),
    "status"    TEXT             NOT NULL,
    "amount"    DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankConfiguration"
(
    "id"             TEXT             NOT NULL DEFAULT gen_random_uuid(),
    "bankId"         TEXT             NOT NULL,
    "maxLoanAmount"  DOUBLE PRECISION NOT NULL,
    "approvalLimits" JSONB            NOT NULL,
    "interestRates"  JSONB            NOT NULL,
    "loanDurations"  JSONB            NOT NULL,
    "currency"       TEXT             NOT NULL,

    CONSTRAINT "BankConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanApplication"
(
    "id"              TEXT             NOT NULL DEFAULT gen_random_uuid(),
    "applicantId"     TEXT             NOT NULL,
    "bankId"          TEXT             NOT NULL,
    "loanType"        "LoanType"       NOT NULL,
    "amountRequested" DOUBLE PRECISION NOT NULL,
    "status"          "LoanStatus"     NOT NULL,
    "createdAt"       TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "LoanApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document"
(
    "id"                 TEXT                 NOT NULL DEFAULT gen_random_uuid(),
    "loanApplicationId"  TEXT                 NOT NULL,
    "documentType"       TEXT                 NOT NULL,
    "fileUrl"            TEXT                 NOT NULL,
    "storageType"        TEXT                 NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "metadata"           JSONB,
    "uploadedAt"         TIMESTAMP(3)         NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification"
(
    "id"                TEXT                 NOT NULL DEFAULT gen_random_uuid(),
    "loanApplicationId" TEXT                 NOT NULL,
    "type"              "VerificationType"   NOT NULL,
    "status"            "VerificationStatus" NOT NULL,
    "verifiedById"      TEXT,
    "verifiedAt"        TIMESTAMP(3),
    "notes"             TEXT,
    "feedback"          TEXT,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog"
(
    "id"         TEXT         NOT NULL DEFAULT gen_random_uuid(),
    "action"     TEXT         NOT NULL,
    "tableName"  TEXT         NOT NULL,
    "userId"     TEXT         NOT NULL,
    "recordId"   TEXT,
    "timestamp"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oldData"    JSONB,
    "newData"    JSONB,
    "ipAddress"  TEXT,
    "deviceInfo" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_authId_key" ON "UserProfile" ("authId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile" ("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_phoneNumber_key" ON "UserProfile" ("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_bankId_key" ON "Subscription" ("bankId");

-- AddForeignKey
ALTER TABLE "UserRoles"
    ADD CONSTRAINT "UserRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("authId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoles"
    ADD CONSTRAINT "UserRoles_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant"
    ADD CONSTRAINT "Applicant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("auth_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanObligation"
    ADD CONSTRAINT "LoanObligation_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanObligationDetail"
    ADD CONSTRAINT "LoanObligationDetail_loanObligationId_fkey" FOREIGN KEY ("loanObligationId") REFERENCES "LoanObligation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income"
    ADD CONSTRAINT "Income_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeDetail"
    ADD CONSTRAINT "IncomeDetail_incomeId_fkey" FOREIGN KEY ("incomeId") REFERENCES "Income" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependent"
    ADD CONSTRAINT "Dependent_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription"
    ADD CONSTRAINT "Subscription_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankConfiguration"
    ADD CONSTRAINT "BankConfiguration_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanApplication"
    ADD CONSTRAINT "LoanApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanApplication"
    ADD CONSTRAINT "LoanApplication_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document"
    ADD CONSTRAINT "Document_loanApplicationId_fkey" FOREIGN KEY ("loanApplicationId") REFERENCES "LoanApplication" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification"
    ADD CONSTRAINT "Verification_loanApplicationId_fkey" FOREIGN KEY ("loanApplicationId") REFERENCES "LoanApplication" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification"
    ADD CONSTRAINT "Verification_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "UserProfile" ("auth_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("auth_id") ON DELETE RESTRICT ON UPDATE CASCADE;
