/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `EstablishmentProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EstablishmentProfile" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "EstablishmentProfile_slug_key" ON "EstablishmentProfile"("slug");
