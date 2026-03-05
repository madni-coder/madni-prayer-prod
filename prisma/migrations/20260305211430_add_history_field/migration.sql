-- AlterTable
ALTER TABLE "tasbih_users" ADD COLUMN     "history" JSONB[] DEFAULT ARRAY[]::JSONB[];
