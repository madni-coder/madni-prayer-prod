-- CreateTable
CREATE TABLE "public"."notice_images" (
    "id" SERIAL NOT NULL,
    "imageName" TEXT NOT NULL,
    "imageSrc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notice_images_pkey" PRIMARY KEY ("id")
);
