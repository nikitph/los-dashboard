/*
  Warnings:

  - You are about to drop the `application_number_sequences` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "application_number_sequences" DROP CONSTRAINT "application_number_sequences_bank_id_fkey";

-- DropTable
DROP TABLE "application_number_sequences";
