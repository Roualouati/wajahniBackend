/*
  Warnings:

  - You are about to drop the column `geographyComment` on the `LiteratureBac` table. All the data in the column will be lost.
  - You are about to drop the column `geographyNote` on the `LiteratureBac` table. All the data in the column will be lost.
  - You are about to drop the column `historyComment` on the `LiteratureBac` table. All the data in the column will be lost.
  - You are about to drop the column `historyNote` on the `LiteratureBac` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LiteratureBac" DROP COLUMN "geographyComment",
DROP COLUMN "geographyNote",
DROP COLUMN "historyComment",
DROP COLUMN "historyNote",
ADD COLUMN     "historyAndGeographyComment" TEXT,
ADD COLUMN     "historyAndGeographyNote" DOUBLE PRECISION;
