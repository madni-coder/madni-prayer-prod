/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `job_seekers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "job_seekers" ADD COLUMN     "password" TEXT NOT NULL DEFAULT 'password123';

-- CreateIndex
CREATE UNIQUE INDEX "job_seekers_email_key" ON "job_seekers"("email");
