-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EXECUTOR', 'MANAGER', 'CUSTOMER', 'ADMIN', 'OBSERVER');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('WORK', 'DEFECT', 'INSTALLATION');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "position" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EXECUTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departmentId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkLog" (
    "id" TEXT NOT NULL,
    "objectType" TEXT,
    "recordType" "RecordType" NOT NULL DEFAULT 'WORK',
    "object" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "photoUrls" TEXT[],
    "beforePhotoUrls" TEXT[],
    "extraFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "departmentId" TEXT,

    CONSTRAINT "WorkLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExecutorsOnLogs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "_ExecutorsOnLogs_AB_unique" ON "_ExecutorsOnLogs"("A", "B");

-- CreateIndex
CREATE INDEX "_ExecutorsOnLogs_B_index" ON "_ExecutorsOnLogs"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkLog" ADD CONSTRAINT "WorkLog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkLog" ADD CONSTRAINT "WorkLog_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExecutorsOnLogs" ADD CONSTRAINT "_ExecutorsOnLogs_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExecutorsOnLogs" ADD CONSTRAINT "_ExecutorsOnLogs_B_fkey" FOREIGN KEY ("B") REFERENCES "WorkLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
