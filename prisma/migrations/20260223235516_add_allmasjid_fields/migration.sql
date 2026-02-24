/*
  Warnings:

  - You are about to drop the `masjid_committee` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `password` to the `all_masjid` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "masjid_committee" DROP CONSTRAINT "masjid_committee_masjidId_fkey";

-- AlterTable
ALTER TABLE "all_masjid" DROP COLUMN "password",
ADD COLUMN "password" INTEGER;

-- Populate existing rows with a safe default so NOT NULL can be enforced later
UPDATE "all_masjid" SET "password" = 0 WHERE "password" IS NULL;

-- Now enforce NOT NULL if desired
ALTER TABLE "all_masjid" ALTER COLUMN "password" SET NOT NULL;

-- DropTable
DROP TABLE "masjid_committee";
