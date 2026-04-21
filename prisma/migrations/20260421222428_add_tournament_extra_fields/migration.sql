-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "discord_url" TEXT,
ADD COLUMN     "entry_fee" DOUBLE PRECISION,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "prize_pool" TEXT;
