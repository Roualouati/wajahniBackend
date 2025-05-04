-- AlterTable
ALTER TABLE "Baccalaureate" ADD COLUMN     "arabicComment" TEXT,
ADD COLUMN     "englishComment" TEXT,
ADD COLUMN     "frenshComment" TEXT,
ADD COLUMN     "globalComment" TEXT,
ADD COLUMN     "mathematicsComment" TEXT,
ADD COLUMN     "optionComment" TEXT,
ADD COLUMN     "philosophyComment" TEXT,
ADD COLUMN     "physicsComment" TEXT,
ADD COLUMN     "sportComment" TEXT;

-- AlterTable
ALTER TABLE "ComputerScienceBac" ADD COLUMN     "algorithmsComment" TEXT,
ADD COLUMN     "stiComment" TEXT;

-- AlterTable
ALTER TABLE "EconomicsAndManagementBac" ADD COLUMN     "economicsComment" TEXT,
ADD COLUMN     "historyAndGeographyComment" TEXT,
ADD COLUMN     "informaticsComment" TEXT,
ADD COLUMN     "managementComment" TEXT;

-- AlterTable
ALTER TABLE "ExperimentalSciencesBac" ADD COLUMN     "informaticsComment" TEXT,
ADD COLUMN     "scienceComment" TEXT;

-- AlterTable
ALTER TABLE "LiteratureBac" ADD COLUMN     "geographyComment" TEXT,
ADD COLUMN     "historyComment" TEXT,
ADD COLUMN     "informaticsComment" TEXT,
ADD COLUMN     "islamicComment" TEXT;

-- AlterTable
ALTER TABLE "MathematicsBac" ADD COLUMN     "informaticsComment" TEXT,
ADD COLUMN     "scienceComment" TEXT;

-- AlterTable
ALTER TABLE "SportsBac" ADD COLUMN     "biologicalSciencesComment" TEXT,
ADD COLUMN     "informaticsComment" TEXT,
ADD COLUMN     "physicalEducationComment" TEXT,
ADD COLUMN     "scienceComment" TEXT,
ADD COLUMN     "sportsSpecializationComment" TEXT;

-- AlterTable
ALTER TABLE "TechnicalBac" ADD COLUMN     "informaticsComment" TEXT,
ADD COLUMN     "technicalComment" TEXT;
