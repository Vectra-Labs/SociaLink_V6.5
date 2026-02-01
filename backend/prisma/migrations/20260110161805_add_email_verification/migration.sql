/*
  Warnings:

  - A unique constraint covering the columns `[code,target_role]` on the table `SubscriptionPlanConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('SCAM', 'HARASSMENT', 'NO_SHOW', 'PAYMENT_ISSUE', 'OTHER');

-- DropIndex
DROP INDEX "SubscriptionPlanConfig_code_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "admin_permissions" JSONB,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationCode" TEXT,
ADD COLUMN     "verificationCodeExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Payment" (
    "payment_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "subscription_id" INTEGER,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT,
    "transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "log_id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "dispute_id" SERIAL NOT NULL,
    "reporter_id" INTEGER NOT NULL,
    "target_id" INTEGER NOT NULL,
    "mission_id" INTEGER,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "type" "DisputeType" NOT NULL,
    "description" TEXT NOT NULL,
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("dispute_id")
);

-- CreateTable
CREATE TABLE "MarketingBanner" (
    "banner_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "image_url" TEXT,
    "link" TEXT,
    "target_role" "UserRole",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingBanner_pkey" PRIMARY KEY ("banner_id")
);

-- CreateTable
CREATE TABLE "AdminMessage" (
    "message_id" SERIAL NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminMessage_pkey" PRIMARY KEY ("message_id")
);

-- CreateIndex
CREATE INDEX "Payment_user_id_idx" ON "Payment"("user_id");

-- CreateIndex
CREATE INDEX "Payment_created_at_idx" ON "Payment"("created_at");

-- CreateIndex
CREATE INDEX "AdminLog_admin_id_idx" ON "AdminLog"("admin_id");

-- CreateIndex
CREATE INDEX "AdminLog_action_idx" ON "AdminLog"("action");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE INDEX "Dispute_reporter_id_idx" ON "Dispute"("reporter_id");

-- CreateIndex
CREATE INDEX "Dispute_target_id_idx" ON "Dispute"("target_id");

-- CreateIndex
CREATE INDEX "AdminMessage_sender_id_idx" ON "AdminMessage"("sender_id");

-- CreateIndex
CREATE INDEX "AdminMessage_receiver_id_idx" ON "AdminMessage"("receiver_id");

-- CreateIndex
CREATE INDEX "AdminMessage_created_at_idx" ON "AdminMessage"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlanConfig_code_target_role_key" ON "SubscriptionPlanConfig"("code", "target_role");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscription"("subscription_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "Mission"("mission_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminMessage" ADD CONSTRAINT "AdminMessage_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminMessage" ADD CONSTRAINT "AdminMessage_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
