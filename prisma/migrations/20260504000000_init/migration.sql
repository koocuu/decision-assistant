-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('DRAFT', 'ANALYZED', 'DECIDED', 'REVIEWED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "background" TEXT NOT NULL,
    "concern" TEXT,
    "fear" TEXT,
    "emotions" TEXT,
    "deadline" TIMESTAMP(3),
    "aiAnalysis" TEXT,
    "finalChoice" TEXT,
    "status" "DecisionStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionOption" (
    "id" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "DecisionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionReview" (
    "id" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "actualResult" TEXT NOT NULL,
    "regretScore" INTEGER NOT NULL,
    "outcome" TEXT,
    "fearHappened" BOOLEAN,
    "wouldChooseAgain" BOOLEAN,
    "lesson" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "summary" TEXT,
    "commonCategories" TEXT,
    "commonConcerns" TEXT,
    "commonEmotions" TEXT,
    "commonBiases" TEXT,
    "lowRegretStrategies" TEXT,
    "highRegretPatterns" TEXT,
    "lowRegretPatterns" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "DecisionOption" ADD CONSTRAINT "DecisionOption_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionReview" ADD CONSTRAINT "DecisionReview_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;
