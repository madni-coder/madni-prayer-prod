-- CreateTable
CREATE TABLE "public"."all_masjid" (
    "id" SERIAL NOT NULL,
    "masjidName" TEXT NOT NULL,
    "colony" TEXT,
    "locality" TEXT,
    "fazar" TEXT,
    "zuhar" TEXT,
    "asar" TEXT,
    "maghrib" TEXT,
    "isha" TEXT,
    "juma" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "all_masjid_pkey" PRIMARY KEY ("id")
);
