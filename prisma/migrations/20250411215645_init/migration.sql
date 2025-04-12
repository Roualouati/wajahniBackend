/*
  Warnings:

  - You are about to drop the column `description` on the `Recommendation` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedPaths` on the `Recommendation` table. All the data in the column will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Result` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `detailedAnalysis` to the `Recommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalityType` to the `Recommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strengths` to the `Recommendation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_testId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_testId_fkey";

-- DropForeignKey
ALTER TABLE "Test" DROP CONSTRAINT "Test_userId_fkey";

-- AlterTable
ALTER TABLE "Recommendation" DROP COLUMN "description",
DROP COLUMN "recommendedPaths",
ADD COLUMN     "competenceTestId" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "detailedAnalysis" TEXT NOT NULL,
ADD COLUMN     "personalityTestId" INTEGER,
ADD COLUMN     "personalityType" TEXT NOT NULL,
ADD COLUMN     "strengths" JSONB NOT NULL,
ADD COLUMN     "studyPaths" TEXT[];

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "Result";

-- DropTable
DROP TABLE "Test";

-- DropTable
DROP TABLE "Users";

-- DropEnum
DROP TYPE "Choice";

-- DropEnum
DROP TYPE "TestType";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "hashedRefreshToken" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalityTest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "personalityType" TEXT,

    CONSTRAINT "PersonalityTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalityCritique" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "testId" INTEGER NOT NULL,
    "score" INTEGER,

    CONSTRAINT "PersonalityCritique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalityQuestion" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "selectedOption" TEXT,
    "position" INTEGER NOT NULL,
    "critiqueId" INTEGER NOT NULL,

    CONSTRAINT "PersonalityQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetenceTest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "strengths" JSONB,

    CONSTRAINT "CompetenceTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetenceCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "testId" INTEGER NOT NULL,
    "score" INTEGER,

    CONSTRAINT "CompetenceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetenceQuestion" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "selectedOption" INTEGER,
    "position" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "CompetenceQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "PersonalityTest" ADD CONSTRAINT "PersonalityTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalityCritique" ADD CONSTRAINT "PersonalityCritique_testId_fkey" FOREIGN KEY ("testId") REFERENCES "PersonalityTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalityQuestion" ADD CONSTRAINT "PersonalityQuestion_critiqueId_fkey" FOREIGN KEY ("critiqueId") REFERENCES "PersonalityCritique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetenceTest" ADD CONSTRAINT "CompetenceTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetenceCategory" ADD CONSTRAINT "CompetenceCategory_testId_fkey" FOREIGN KEY ("testId") REFERENCES "CompetenceTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetenceQuestion" ADD CONSTRAINT "CompetenceQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CompetenceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_personalityTestId_fkey" FOREIGN KEY ("personalityTestId") REFERENCES "PersonalityTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_competenceTestId_fkey" FOREIGN KEY ("competenceTestId") REFERENCES "CompetenceTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
