-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "all_masjid" (
    "id" SERIAL NOT NULL,
    "masjidName" TEXT NOT NULL,
    "colony" TEXT,
    "locality" TEXT,
    "fazar" TEXT,
    "zuhar" TEXT,
    "asar" TEXT,
    "maghrib" TEXT,
    "isha" TEXT,
    "taravih" TEXT,
    "juma" TEXT,
    "name" TEXT,
    "role" TEXT,
    "mobile" TEXT,
    "pasteMapUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "all_masjid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasbih_users" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "weeklyCounts" BIGINT NOT NULL DEFAULT 0,
    "count" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasbih_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notice_images" (
    "id" SERIAL NOT NULL,
    "imageName" TEXT NOT NULL,
    "imageSrc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notice_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileTable" (
    "id" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,

    CONSTRAINT "FileTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "areaMasjid" TEXT NOT NULL,
    "from" TEXT NOT NULL DEFAULT '',
    "to" TEXT NOT NULL DEFAULT '',
    "counts" INTEGER NOT NULL DEFAULT 0,
    "weeklyCounts" BIGINT NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zikr" (
    "id" SERIAL NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'Male',
    "fullName" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "areaMasjid" TEXT NOT NULL DEFAULT '',
    "mobile" TEXT,
    "zikrType" TEXT NOT NULL,
    "zikrCounts" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zikr_pkey" PRIMARY KEY ("id")
);

