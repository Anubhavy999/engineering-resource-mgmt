/*
  Warnings:

  - A unique constraint covering the columns `[taskId]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "taskId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_taskId_key" ON "Assignment"("taskId");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
