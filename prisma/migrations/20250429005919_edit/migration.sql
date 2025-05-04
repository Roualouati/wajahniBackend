/*
  Warnings:

  - You are about to drop the column `notePhysics` on the `Baccalaureate` table. All the data in the column will be lost.
  - You are about to drop the column `physicsComment` on the `Baccalaureate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Baccalaureate" DROP COLUMN "notePhysics",
DROP COLUMN "physicsComment";

-- AlterTable
ALTER TABLE "ComputerScienceBac" ADD COLUMN     "notePhysics" DOUBLE PRECISION,
ADD COLUMN     "physicsComment" TEXT;

-- AlterTable
ALTER TABLE "ExperimentalSciencesBac" ADD COLUMN     "notePhysics" DOUBLE PRECISION,
ADD COLUMN     "physicsComment" TEXT;

-- AlterTable
ALTER TABLE "MathematicsBac" ADD COLUMN     "notePhysics" DOUBLE PRECISION,
ADD COLUMN     "physicsComment" TEXT;

-- AlterTable
ALTER TABLE "SportsBac" ADD COLUMN     "notePhysics" DOUBLE PRECISION,
ADD COLUMN     "physicsComment" TEXT;

-- AlterTable
ALTER TABLE "TechnicalBac" ADD COLUMN     "notePhysics" DOUBLE PRECISION,
ADD COLUMN     "physicsComment" TEXT;
