/*
  Warnings:

  - The values [snacks] on the enum `MealType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MealType_new" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
ALTER TABLE "Meal" ALTER COLUMN "type" TYPE "MealType_new" USING ("type"::text::"MealType_new");
ALTER TYPE "MealType" RENAME TO "MealType_old";
ALTER TYPE "MealType_new" RENAME TO "MealType";
DROP TYPE "MealType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "targetCalories" INTEGER DEFAULT 2000,
ADD COLUMN     "targetCarbs" INTEGER DEFAULT 244,
ADD COLUMN     "targetFat" INTEGER DEFAULT 68,
ADD COLUMN     "targetProtein" INTEGER DEFAULT 98;
