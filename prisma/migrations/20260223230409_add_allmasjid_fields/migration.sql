/*
  Warnings:

  - A unique constraint covering the columns `[loginId]` on the table `all_masjid` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "all_masjid" ADD COLUMN     "loginId" INTEGER,
ADD COLUMN     "memberNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "mobileNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "password" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "all_masjid_loginId_key" ON "all_masjid"("loginId");
