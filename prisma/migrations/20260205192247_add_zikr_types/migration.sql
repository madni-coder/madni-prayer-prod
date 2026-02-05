/*
  Warnings:

  - You are about to drop the column `zikrType` on the `zikr` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "zikr" DROP COLUMN "zikrType",
ADD COLUMN     "zikrTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];
