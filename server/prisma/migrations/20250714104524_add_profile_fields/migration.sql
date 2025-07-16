/*
  Warnings:

  - You are about to drop the column `addressLine` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "addressLine",
DROP COLUMN "profileImage",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lastPasswordChange" TIMESTAMP(3),
ADD COLUMN     "performance" TEXT,
ADD COLUMN     "projectsAssigned" INTEGER DEFAULT 0,
ADD COLUMN     "tasksCompleted" INTEGER DEFAULT 0,
ADD COLUMN     "taxId" TEXT;
