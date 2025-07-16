/*
  Warnings:

  - You are about to drop the column `department` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `employmentType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `seniority` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "department",
DROP COLUMN "employmentType",
DROP COLUMN "seniority",
ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "managerId" INTEGER,
ALTER COLUMN "role" SET DEFAULT 'ENGINEER';

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
