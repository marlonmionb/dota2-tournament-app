-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "registered_by_id" TEXT;

-- CreateIndex
CREATE INDEX "teams_registered_by_id_idx" ON "teams"("registered_by_id");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_registered_by_id_fkey" FOREIGN KEY ("registered_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
