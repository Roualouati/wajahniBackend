/*
  Warnings:

  - You are about to drop the column `competenceTestId` on the `Recommendation` table. All the data in the column will be lost.
  - You are about to drop the column `strengths` on the `Recommendation` table. All the data in the column will be lost.
  - You are about to drop the `CompetenceCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompetenceQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompetenceTest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompetenceCategory" DROP CONSTRAINT "CompetenceCategory_testId_fkey";

-- DropForeignKey
ALTER TABLE "CompetenceQuestion" DROP CONSTRAINT "CompetenceQuestion_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CompetenceTest" DROP CONSTRAINT "CompetenceTest_userId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_competenceTestId_fkey";

-- AlterTable
ALTER TABLE "Recommendation" DROP COLUMN "competenceTestId",
DROP COLUMN "strengths";

-- DropTable
DROP TABLE "CompetenceCategory";

-- DropTable
DROP TABLE "CompetenceQuestion";

-- DropTable
DROP TABLE "CompetenceTest";
