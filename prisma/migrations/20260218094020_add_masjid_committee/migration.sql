-- CreateTable
CREATE TABLE "masjid_committee" (
    "id" SERIAL NOT NULL,
    "masjidName" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "mutwalliName" TEXT NOT NULL,
    "committeeMembers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mobileNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imaamName" TEXT,
    "masjidId" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "masjid_committee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "masjid_committee_masjidId_key" ON "masjid_committee"("masjidId");

-- AddForeignKey
ALTER TABLE "masjid_committee" ADD CONSTRAINT "masjid_committee_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "all_masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
