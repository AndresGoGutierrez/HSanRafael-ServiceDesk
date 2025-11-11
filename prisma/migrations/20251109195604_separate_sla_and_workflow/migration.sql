/*
  Warnings:

  - You are about to drop the column `slaResolutionMinutes` on the `Area` table. All the data in the column will be lost.
  - You are about to drop the column `slaResponseMinutes` on the `Area` table. All the data in the column will be lost.
  - You are about to drop the column `workflowConfig` on the `Area` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Area" DROP COLUMN "slaResolutionMinutes",
DROP COLUMN "slaResponseMinutes",
DROP COLUMN "workflowConfig";

-- CreateTable
CREATE TABLE "SLA" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "areaId" UUID NOT NULL,
    "responseTimeMinutes" INTEGER NOT NULL,
    "resolutionTimeMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SLA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "areaId" UUID NOT NULL,
    "transitions" JSONB NOT NULL,
    "requiredFields" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SLA_areaId_key" ON "SLA"("areaId");

-- CreateIndex
CREATE INDEX "SLA_areaId_idx" ON "SLA"("areaId");

-- CreateIndex
CREATE INDEX "Workflow_areaId_idx" ON "Workflow"("areaId");

-- AddForeignKey
ALTER TABLE "SLA" ADD CONSTRAINT "SLA_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;
