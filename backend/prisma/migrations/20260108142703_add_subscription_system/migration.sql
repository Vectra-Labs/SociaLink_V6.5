/*
  Warnings:

  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('BASIC', 'PREMIUM', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'URGENT';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_urgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "published_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "link" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "SubscriptionPlanConfig" (
    "plan_id" SERIAL NOT NULL,
    "code" "SubscriptionTier" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target_role" "UserRole" NOT NULL,
    "price_monthly" INTEGER NOT NULL DEFAULT 0,
    "price_yearly" INTEGER,
    "trial_days" INTEGER NOT NULL DEFAULT 0,
    "max_active_applications" INTEGER NOT NULL DEFAULT 3,
    "can_view_urgent_missions" BOOLEAN NOT NULL DEFAULT false,
    "can_view_full_profiles" BOOLEAN NOT NULL DEFAULT false,
    "has_auto_matching" BOOLEAN NOT NULL DEFAULT false,
    "mission_view_delay_hours" INTEGER NOT NULL DEFAULT 48,
    "max_visible_missions" INTEGER,
    "max_active_missions" INTEGER,
    "can_post_urgent" BOOLEAN NOT NULL DEFAULT false,
    "can_search_workers" BOOLEAN NOT NULL DEFAULT false,
    "urgent_mission_fee_percent" INTEGER NOT NULL DEFAULT 30,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlanConfig_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "subscription_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "trial_end_date" TIMESTAMP(3),
    "payment_method" TEXT,
    "payment_reference" TEXT,
    "last_payment_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateTable
CREATE TABLE "UserUsage" (
    "usage_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "applications_count" INTEGER NOT NULL DEFAULT 0,
    "missions_viewed_count" INTEGER NOT NULL DEFAULT 0,
    "missions_published_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserUsage_pkey" PRIMARY KEY ("usage_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlanConfig_code_key" ON "SubscriptionPlanConfig"("code");

-- CreateIndex
CREATE INDEX "SubscriptionPlanConfig_target_role_idx" ON "SubscriptionPlanConfig"("target_role");

-- CreateIndex
CREATE INDEX "SubscriptionPlanConfig_is_active_idx" ON "SubscriptionPlanConfig"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_user_id_key" ON "Subscription"("user_id");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_end_date_idx" ON "Subscription"("end_date");

-- CreateIndex
CREATE INDEX "UserUsage_date_idx" ON "UserUsage"("date");

-- CreateIndex
CREATE UNIQUE INDEX "UserUsage_user_id_date_key" ON "UserUsage"("user_id", "date");

-- CreateIndex
CREATE INDEX "Mission_status_idx" ON "Mission"("status");

-- CreateIndex
CREATE INDEX "Mission_is_urgent_idx" ON "Mission"("is_urgent");

-- CreateIndex
CREATE INDEX "Mission_published_at_idx" ON "Mission"("published_at");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "SubscriptionPlanConfig"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;
