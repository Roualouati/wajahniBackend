/*
  Warnings:

  - A unique constraint covering the columns `[userId,isCompleted]` on the table `PersonalityTest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PersonalityTest_userId_isCompleted_key" ON "PersonalityTest"("userId", "isCompleted");
