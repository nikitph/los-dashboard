-- CreateTable
CREATE TABLE "Guarantor"
(
    "id"                TEXT         NOT NULL DEFAULT gen_random_uuid(),
    "loanApplicationId" TEXT         NOT NULL,
    "firstName"         TEXT         NOT NULL,
    "lastName"          TEXT         NOT NULL,
    "email"             TEXT         NOT NULL,
    "addressState"      TEXT         NOT NULL,
    "addressCity"       TEXT         NOT NULL,
    "addressZipCode"    TEXT         NOT NULL,
    "addressLine1"      TEXT         NOT NULL,
    "addressLine2"      TEXT,
    "mobileNumber"      TEXT         NOT NULL,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,
    "deletedAt"         TIMESTAMP(3),

    CONSTRAINT "Guarantor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Guarantor"
    ADD CONSTRAINT "Guarantor_loanApplicationId_fkey" FOREIGN KEY ("loanApplicationId") REFERENCES "LoanApplication" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
