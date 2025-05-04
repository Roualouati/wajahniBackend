-- This is an empty migration.
CREATE UNIQUE INDEX one_incomplete_test_per_user
ON "PersonalityTest"("userId")
WHERE "isCompleted" = false;
