CREATE TYPE "DataSubjectRequestType" AS ENUM ('ACCESS', 'COPY', 'RECTIFICATION', 'ERASURE', 'RESTRICTION', 'PORTABILITY', 'OBJECTION', 'WITHDRAW_CONSENT', 'AUTOMATED_DECISION', 'OTHER');
CREATE TYPE "DataSubjectRequestStatus" AS ENUM ('DRAFT', 'RECEIVED', 'IDENTITY_VERIFICATION', 'IN_PROGRESS', 'WAITING_FOR_INFORMATION', 'RESPONSE_PREPARED', 'RESPONDED', 'REJECTED', 'CLOSED', 'CANCELLED');
CREATE TYPE "DataSubjectRequestPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "DataSubjectRequestVerificationStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'VERIFIED', 'FAILED', 'NOT_REQUIRED');
CREATE TYPE "DataSubjectRequestActivityType" AS ENUM ('CREATED', 'SUBMITTED', 'UPDATED', 'STATUS_CHANGED', 'IDENTITY_VERIFICATION_UPDATED', 'RESPONSE_PREPARED', 'RESPONSE_MARKED_SENT', 'NOTE_ADDED', 'TASK_CREATED', 'CLOSED');
CREATE TYPE "DataSubjectRequestActivityVisibility" AS ENUM ('INTERNAL', 'PUBLIC');

ALTER TABLE "CrmTask" ADD COLUMN "dataSubjectRequestId" TEXT;

CREATE TABLE "DataSubjectRequest" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "reportedById" TEXT,
  "assignedToId" TEXT,
  "requesterName" TEXT NOT NULL,
  "requesterEmail" TEXT NOT NULL,
  "requesterPhone" TEXT,
  "relationship" TEXT,
  "type" "DataSubjectRequestType" NOT NULL,
  "status" "DataSubjectRequestStatus" NOT NULL DEFAULT 'DRAFT',
  "priority" "DataSubjectRequestPriority" NOT NULL DEFAULT 'NORMAL',
  "requestDescription" TEXT NOT NULL,
  "requestChannel" TEXT DEFAULT 'PORTAL',
  "additionalInformation" TEXT,
  "receivedAt" TIMESTAMP(3),
  "dueAt" TIMESTAMP(3),
  "extensionUntil" TIMESTAMP(3),
  "extensionReason" TEXT,
  "closedAt" TIMESTAMP(3),
  "verificationStatus" "DataSubjectRequestVerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "verificationMethod" TEXT,
  "verificationNote" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "responseSummary" TEXT,
  "responseDraft" TEXT,
  "responseDecision" TEXT,
  "responsePreparedAt" TIMESTAMP(3),
  "responseSentAt" TIMESTAMP(3),
  "decisionRationale" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DataSubjectRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DataSubjectRequestActivity" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "actorId" TEXT,
  "type" "DataSubjectRequestActivityType" NOT NULL,
  "visibility" "DataSubjectRequestActivityVisibility" NOT NULL DEFAULT 'INTERNAL',
  "title" TEXT NOT NULL,
  "note" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DataSubjectRequestActivity_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CrmTask" DROP CONSTRAINT IF EXISTS "CrmTask_has_parent_check";
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_has_parent_check" CHECK ("leadId" IS NOT NULL OR "organizationId" IS NOT NULL OR "dataSubjectRequestId" IS NOT NULL);

CREATE INDEX "CrmTask_dataSubjectRequestId_status_idx" ON "CrmTask"("dataSubjectRequestId", "status");
CREATE INDEX "DataSubjectRequest_organizationId_status_dueAt_idx" ON "DataSubjectRequest"("organizationId", "status", "dueAt");
CREATE INDEX "DataSubjectRequest_reportedById_createdAt_idx" ON "DataSubjectRequest"("reportedById", "createdAt");
CREATE INDEX "DataSubjectRequest_assignedToId_status_dueAt_idx" ON "DataSubjectRequest"("assignedToId", "status", "dueAt");
CREATE INDEX "DataSubjectRequest_status_dueAt_idx" ON "DataSubjectRequest"("status", "dueAt");
CREATE INDEX "DataSubjectRequest_type_createdAt_idx" ON "DataSubjectRequest"("type", "createdAt");
CREATE INDEX "DataSubjectRequest_requesterEmail_idx" ON "DataSubjectRequest"("requesterEmail");
CREATE INDEX "DataSubjectRequestActivity_requestId_createdAt_idx" ON "DataSubjectRequestActivity"("requestId", "createdAt");
CREATE INDEX "DataSubjectRequestActivity_actorId_createdAt_idx" ON "DataSubjectRequestActivity"("actorId", "createdAt");
CREATE INDEX "DataSubjectRequestActivity_type_createdAt_idx" ON "DataSubjectRequestActivity"("type", "createdAt");

ALTER TABLE "CrmTask"
  ADD CONSTRAINT "CrmTask_dataSubjectRequestId_fkey"
  FOREIGN KEY ("dataSubjectRequestId") REFERENCES "DataSubjectRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DataSubjectRequest"
  ADD CONSTRAINT "DataSubjectRequest_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataSubjectRequest"
  ADD CONSTRAINT "DataSubjectRequest_reportedById_fkey"
  FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DataSubjectRequest"
  ADD CONSTRAINT "DataSubjectRequest_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DataSubjectRequestActivity"
  ADD CONSTRAINT "DataSubjectRequestActivity_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "DataSubjectRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataSubjectRequestActivity"
  ADD CONSTRAINT "DataSubjectRequestActivity_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DataSubjectRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataSubjectRequestActivity" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "DataSubjectRequest" FROM anon, authenticated;
REVOKE ALL ON TABLE "DataSubjectRequestActivity" FROM anon, authenticated;
