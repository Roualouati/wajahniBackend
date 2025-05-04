-- DropForeignKey
ALTER TABLE "PersonalityQuestion" DROP CONSTRAINT "PersonalityQuestion_critiqueId_fkey";

-- AddForeignKey
ALTER TABLE "PersonalityQuestion" ADD CONSTRAINT "PersonalityQuestion_critiqueId_fkey" FOREIGN KEY ("critiqueId") REFERENCES "PersonalityCritique"("id") ON DELETE CASCADE ON UPDATE CASCADE;
