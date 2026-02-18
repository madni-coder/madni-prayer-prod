/*
  Warnings:

  - You are about to drop the column `committeeImage` on the `masjid_committee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "masjid_committee" DROP COLUMN "committeeImage",
ADD COLUMN     "committeeImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
