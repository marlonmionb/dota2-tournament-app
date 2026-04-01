-- CreateEnum
CREATE TYPE "MatchSlot" AS ENUM ('TEAM_A', 'TEAM_B');

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_team_a_id_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_team_b_id_fkey";

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "next_match_slot" "MatchSlot",
ALTER COLUMN "team_a_id" DROP NOT NULL,
ALTER COLUMN "team_b_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_a_id_fkey" FOREIGN KEY ("team_a_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_b_id_fkey" FOREIGN KEY ("team_b_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
