/*
  Warnings:

  - The `status` column on the `Mission` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "status",
ADD COLUMN     "status" "MissionStatus" NOT NULL DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "Review" (
    "review_id" SERIAL NOT NULL,
    "mission_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "target_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("review_id")
);

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "Mission"("mission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
