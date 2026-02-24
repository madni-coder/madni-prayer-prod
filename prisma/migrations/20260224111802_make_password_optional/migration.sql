/*
  Warnings:

  - You are about to drop the `masjid_committee` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[loginId]` on the table `all_masjid` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "masjid_committee" DROP CONSTRAINT "masjid_committee_masjidId_fkey";

-- AlterTable
ALTER TABLE "all_masjid" ADD COLUMN     "loginId" INTEGER,
ADD COLUMN     "memberNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "mobileNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "password" INTEGER;

-- DropTable
DROP TABLE "masjid_committee";

-- CreateIndex
CREATE UNIQUE INDEX "all_masjid_loginId_key" ON "all_masjid"("loginId");
