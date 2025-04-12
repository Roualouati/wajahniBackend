-- DropForeignKey
ALTER TABLE "CompetenceTest" DROP CONSTRAINT "CompetenceTest_userId_fkey";

-- DropForeignKey
ALTER TABLE "PersonalityCritique" DROP CONSTRAINT "PersonalityCritique_testId_fkey";

-- DropForeignKey
ALTER TABLE "PersonalityTest" DROP CONSTRAINT "PersonalityTest_userId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_userId_fkey";

-- AddForeignKey
ALTER TABLE "PersonalityTest" ADD CONSTRAINT "PersonalityTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalityCritique" ADD CONSTRAINT "PersonalityCritique_testId_fkey" FOREIGN KEY ("testId") REFERENCES "PersonalityTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetenceTest" ADD CONSTRAINT "CompetenceTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
