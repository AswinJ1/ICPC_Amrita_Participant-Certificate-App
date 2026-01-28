/*
  Warnings:

  - You are about to drop the column `teamId` on the `downloadcount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,name]` on the table `downloadcount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "downloadcount_email_name_teamId_key";

-- AlterTable
ALTER TABLE "downloadcount" DROP COLUMN "teamId";

-- CreateIndex
CREATE UNIQUE INDEX "downloadcount_email_name_key" ON "downloadcount"("email", "name");
