-- CreateTable
CREATE TABLE "public"."para_file" (
    "id" SERIAL NOT NULL,
    "paraNumber" INTEGER NOT NULL,
    "fileNo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "para_file_pkey" PRIMARY KEY ("id")
);
