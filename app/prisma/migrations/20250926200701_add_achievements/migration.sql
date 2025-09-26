-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('STREAK_3_DAYS', 'STREAK_5_DAYS', 'STREAK_7_DAYS', 'STREAK_14_DAYS', 'STREAK_30_DAYS', 'FIRST_WORKOUT', 'WORKOUT_MARATHON', 'CONSISTENCY_CHAMPION');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "targetCalories" INTEGER DEFAULT 2000,
ADD COLUMN     "targetCarbs" INTEGER DEFAULT 244,
ADD COLUMN     "targetFat" INTEGER DEFAULT 68,
ADD COLUMN     "targetProtein" INTEGER DEFAULT 98;

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AchievementType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Achievement_userId_earnedAt_idx" ON "Achievement"("userId", "earnedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_userId_type_key" ON "Achievement"("userId", "type");

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
