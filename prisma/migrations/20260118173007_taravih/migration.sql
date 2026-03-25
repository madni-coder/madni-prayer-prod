-- Recreated migration: add taravih column
ALTER TABLE "all_masjid" ADD COLUMN IF NOT EXISTS "taravih" TEXT;
