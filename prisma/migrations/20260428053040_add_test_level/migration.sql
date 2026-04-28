-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Test" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'standard-3',
    "duration" INTEGER NOT NULL,
    "scope" TEXT NOT NULL,
    "passingScore" INTEGER NOT NULL DEFAULT 60,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Test" ("active", "createdAt", "duration", "id", "passingScore", "scope", "subject", "title") SELECT "active", "createdAt", "duration", "id", "passingScore", "scope", "subject", "title" FROM "Test";
DROP TABLE "Test";
ALTER TABLE "new_Test" RENAME TO "Test";
CREATE INDEX "Test_subject_level_active_idx" ON "Test"("subject", "level", "active");
CREATE UNIQUE INDEX "Test_subject_level_key" ON "Test"("subject", "level");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
