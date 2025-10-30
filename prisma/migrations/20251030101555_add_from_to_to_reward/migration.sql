-- AlterTable
ALTER TABLE "public"."rewards" ADD COLUMN     "from" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "to" TEXT NOT NULL DEFAULT '';
