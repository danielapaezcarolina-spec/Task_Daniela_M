-- AlterTable: make companyId optional on Task
ALTER TABLE "Task" ALTER COLUMN "companyId" DROP NOT NULL;
