-- CreateTable
CREATE TABLE "free_services" (
    "id" SERIAL NOT NULL,
    "mutuwalliName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "masjidName" TEXT NOT NULL,
    "numberOfACs" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "free_services_pkey" PRIMARY KEY ("id")
);
