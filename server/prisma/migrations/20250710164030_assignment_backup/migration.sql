-- CreateTable
CREATE TABLE "ProjectAssignmentBackup" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "allocation" INTEGER NOT NULL,

    CONSTRAINT "ProjectAssignmentBackup_pkey" PRIMARY KEY ("id")
);
