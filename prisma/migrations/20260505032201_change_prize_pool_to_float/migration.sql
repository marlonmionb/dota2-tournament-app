/*
  Warnings:

  - The `prize_pool` column on the `tournaments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tournaments" DROP COLUMN "prize_pool",
ADD COLUMN     "prize_pool" DOUBLE PRECISION;
