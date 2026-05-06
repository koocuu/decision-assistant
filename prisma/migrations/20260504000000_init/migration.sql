-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "background" TEXT NOT NULL,
    "concern" TEXT,
    "fear" TEXT,
    "emotions" TEXT,
    "deadline" DATETIME,
    "aiAnalysis" TEXT,
    "finalChoice" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "reviewDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DecisionOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "decisionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "DecisionOption_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DecisionReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "decisionId" TEXT NOT NULL,
    "actualResult" TEXT NOT NULL,
    "regretScore" INTEGER NOT NULL,
    "outcome" TEXT,
    "fearHappened" BOOLEAN,
    "wouldChooseAgain" BOOLEAN,
    "lesson" TEXT,
    "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DecisionReview_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summary" TEXT,
    "commonCategories" TEXT,
    "commonConcerns" TEXT,
    "commonEmotions" TEXT,
    "commonBiases" TEXT,
    "lowRegretStrategies" TEXT,
    "highRegretPatterns" TEXT,
    "lowRegretPatterns" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Decision_status_idx" ON "Decision"("status");

-- CreateIndex
CREATE INDEX "Decision_category_idx" ON "Decision"("category");

-- CreateIndex
CREATE INDEX "Decision_createdAt_idx" ON "Decision"("createdAt");

-- CreateIndex
CREATE INDEX "Decision_reviewDate_idx" ON "Decision"("reviewDate");

-- CreateIndex
CREATE INDEX "DecisionOption_decisionId_idx" ON "DecisionOption"("decisionId");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionReview_decisionId_key" ON "DecisionReview"("decisionId");
