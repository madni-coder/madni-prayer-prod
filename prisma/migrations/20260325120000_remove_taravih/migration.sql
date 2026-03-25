-- Migration: remove taravih column from all_masjid
ALTER TABLE "all_masjid" DROP COLUMN IF EXISTS "taravih";
