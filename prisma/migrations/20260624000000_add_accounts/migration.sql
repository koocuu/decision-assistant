-- Add optional account ownership while preserving existing rows as unclaimed legacy data.

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

ALTER TABLE "Decision" ADD COLUMN "userId" TEXT;
ALTER TABLE "Decision" ADD COLUMN "anonId" TEXT;
ALTER TABLE "DecisionReview" ADD COLUMN "userId" TEXT;
ALTER TABLE "DecisionReview" ADD COLUMN "anonId" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN "userId" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN "anonId" TEXT;

UPDATE "Decision"
SET "anonId" = 'legacy-unclaimed'
WHERE "userId" IS NULL AND "anonId" IS NULL;

UPDATE "DecisionReview" AS review
SET "anonId" = decision."anonId"
FROM "Decision" AS decision
WHERE review."decisionId" = decision."id"
  AND review."userId" IS NULL
  AND review."anonId" IS NULL;

UPDATE "UserProfile"
SET "anonId" = 'legacy-unclaimed'
WHERE "userId" IS NULL AND "anonId" IS NULL;

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
CREATE UNIQUE INDEX "UserProfile_anonId_key" ON "UserProfile"("anonId");

CREATE INDEX "Decision_userId_idx" ON "Decision"("userId");
CREATE INDEX "Decision_anonId_idx" ON "Decision"("anonId");
CREATE INDEX "DecisionReview_userId_idx" ON "DecisionReview"("userId");
CREATE INDEX "DecisionReview_anonId_idx" ON "DecisionReview"("anonId");
CREATE INDEX "UserProfile_userId_idx" ON "UserProfile"("userId");
CREATE INDEX "UserProfile_anonId_idx" ON "UserProfile"("anonId");
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

ALTER TABLE "Decision" ADD CONSTRAINT "Decision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DecisionReview" ADD CONSTRAINT "DecisionReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
