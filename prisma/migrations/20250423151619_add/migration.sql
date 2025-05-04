/*
  Warnings:

  - You are about to drop the column `baccalaureateType` on the `Users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Options" AS ENUM ('CHINESE', 'SPANISH', 'GERMAN', 'DRAWING', 'RUSSIAN', 'MUSIC', 'ITALIAN', 'SCIENCE');

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "baccalaureateType";

-- CreateTable
CREATE TABLE "Baccalaureate" (
    "id" SERIAL NOT NULL,
    "type" "BaccalaureateType" NOT NULL,
    "userId" INTEGER NOT NULL,
    "notePhilosophy" INTEGER,
    "noteArabic" INTEGER,
    "noteEnglish" INTEGER,
    "noteFrench" INTEGER,
    "noteSport" INTEGER,
    "noteMathematics" INTEGER,
    "notePhysics" INTEGER,
    "noteOptions" INTEGER,
    "options" "Options",

    CONSTRAINT "Baccalaureate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentalSciencesBac" (
    "id" SERIAL NOT NULL,
    "baccalaureateId" INTEGER NOT NULL,
    "scienceNote" INTEGER,
    "informaticsNote" INTEGER,

    CONSTRAINT "ExperimentalSciencesBac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComputerScienceBac" (
    "id" SERIAL NOT NULL,
    "baccalaureateId" INTEGER NOT NULL,
    "algorithmsNote" INTEGER,
    "stiNote" INTEGER,

    CONSTRAINT "ComputerScienceBac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiteratureBac" (
    "id" SERIAL NOT NULL,
    "baccalaureateId" INTEGER NOT NULL,
    "historyNote" INTEGER,
    "geographyNote" INTEGER,
    "islamicNote" INTEGER,
    "informaticsNote" INTEGER,

    CONSTRAINT "LiteratureBac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsBac" (
    "id" SERIAL NOT NULL,
    "baccalaureateId" INTEGER NOT NULL,
    "biologicalSciencesNote" INTEGER,
    "physicalEducationNote" INTEGER,
    "informaticsNote" INTEGER,
    "sportsSpecializationNote" INTEGER,
    "scienceNote" INTEGER,

    CONSTRAINT "SportsBac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EconomicsAndManagementBac" (
    "id" SERIAL NOT NULL,
    "baccalaureateId" INTEGER NOT NULL,
    "economicsNote" INTEGER,
    "managementNote" INTEGER,
    "informaticsNote" INTEGER,
    "historyAndGeographyNote" INTEGER,

    CONSTRAINT "EconomicsAndManagementBac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalBac" (
    "id" SERIAL NOT NULL,
    "baccalaureateId" INTEGER NOT NULL,
    "technicalNote" INTEGER,
    "informaticsNote" INTEGER,

    CONSTRAINT "TechnicalBac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MathematicsBac" (
    "id" SERIAL NOT NULL,
    "baccalaureateId" INTEGER NOT NULL,
    "informaticsNote" INTEGER,
    "scienceNote" INTEGER,

    CONSTRAINT "MathematicsBac_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Baccalaureate_userId_key" ON "Baccalaureate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentalSciencesBac_baccalaureateId_key" ON "ExperimentalSciencesBac"("baccalaureateId");

-- CreateIndex
CREATE UNIQUE INDEX "ComputerScienceBac_baccalaureateId_key" ON "ComputerScienceBac"("baccalaureateId");

-- CreateIndex
CREATE UNIQUE INDEX "LiteratureBac_baccalaureateId_key" ON "LiteratureBac"("baccalaureateId");

-- CreateIndex
CREATE UNIQUE INDEX "SportsBac_baccalaureateId_key" ON "SportsBac"("baccalaureateId");

-- CreateIndex
CREATE UNIQUE INDEX "EconomicsAndManagementBac_baccalaureateId_key" ON "EconomicsAndManagementBac"("baccalaureateId");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalBac_baccalaureateId_key" ON "TechnicalBac"("baccalaureateId");

-- CreateIndex
CREATE UNIQUE INDEX "MathematicsBac_baccalaureateId_key" ON "MathematicsBac"("baccalaureateId");

-- AddForeignKey
ALTER TABLE "Baccalaureate" ADD CONSTRAINT "Baccalaureate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentalSciencesBac" ADD CONSTRAINT "ExperimentalSciencesBac_baccalaureateId_fkey" FOREIGN KEY ("baccalaureateId") REFERENCES "Baccalaureate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComputerScienceBac" ADD CONSTRAINT "ComputerScienceBac_baccalaureateId_fkey" FOREIGN KEY ("baccalaureateId") REFERENCES "Baccalaureate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiteratureBac" ADD CONSTRAINT "LiteratureBac_baccalaureateId_fkey" FOREIGN KEY ("baccalaureateId") REFERENCES "Baccalaureate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsBac" ADD CONSTRAINT "SportsBac_baccalaureateId_fkey" FOREIGN KEY ("baccalaureateId") REFERENCES "Baccalaureate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EconomicsAndManagementBac" ADD CONSTRAINT "EconomicsAndManagementBac_baccalaureateId_fkey" FOREIGN KEY ("baccalaureateId") REFERENCES "Baccalaureate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalBac" ADD CONSTRAINT "TechnicalBac_baccalaureateId_fkey" FOREIGN KEY ("baccalaureateId") REFERENCES "Baccalaureate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MathematicsBac" ADD CONSTRAINT "MathematicsBac_baccalaureateId_fkey" FOREIGN KEY ("baccalaureateId") REFERENCES "Baccalaureate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
