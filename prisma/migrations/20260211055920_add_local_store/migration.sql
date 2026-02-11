-- CreateTable
CREATE TABLE "local_stores" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobile" TEXT,
    "shopName" TEXT NOT NULL,
    "shopAddress" TEXT,
    "workType" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_stores_pkey" PRIMARY KEY ("id")
);
