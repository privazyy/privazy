CREATE TYPE "CrmNoteType" AS ENUM ('GENERAL', 'CALL', 'EMAIL', 'MEETING', 'LEGAL', 'INTERNAL');
CREATE TYPE "CrmActivityType" AS ENUM (
  'LEAD_CREATED',
  'LEAD_UPDATED',
  'LEAD_STATUS_CHANGED',
  'LEAD_ASSIGNED',
  'LEAD_CONVERTED',
  'ORGANIZATION_CREATED',
  'ORGANIZATION_UPDATED',
  'NOTE_ADDED',
  'NOTE_UPDATED',
  'TASK_CREATED',
  'TASK_UPDATED',
  'TASK_ASSIGNED',
  'TASK_COMPLETED',
  'TASK_CANCELLED',
  'EMAIL_LOGGED',
  'CALL_LOGGED',
  'MEETING_LOGGED',
  'SYSTEM_EVENT'
);

ALTER TABLE "CrmNote"
  ADD COLUMN "type" "CrmNoteType" NOT NULL DEFAULT 'GENERAL';

ALTER TABLE "CrmTask"
  ADD COLUMN "cancelledAt" TIMESTAMP(3);

CREATE TABLE "CrmActivity" (
  "id" TEXT NOT NULL,
  "leadId" TEXT,
  "organizationId" TEXT,
  "actorId" TEXT,
  "type" "CrmActivityType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CrmActivity_has_parent_check" CHECK ("leadId" IS NOT NULL OR "organizationId" IS NOT NULL)
);

CREATE INDEX "CrmNote_type_createdAt_idx" ON "CrmNote"("type", "createdAt");
CREATE INDEX "CrmTask_status_idx" ON "CrmTask"("status");
CREATE INDEX "CrmActivity_leadId_createdAt_idx" ON "CrmActivity"("leadId", "createdAt");
CREATE INDEX "CrmActivity_organizationId_createdAt_idx" ON "CrmActivity"("organizationId", "createdAt");
CREATE INDEX "CrmActivity_actorId_idx" ON "CrmActivity"("actorId");
CREATE INDEX "CrmActivity_type_createdAt_idx" ON "CrmActivity"("type", "createdAt");
CREATE INDEX "CrmActivity_createdAt_idx" ON "CrmActivity"("createdAt");

ALTER TABLE "CrmActivity"
  ADD CONSTRAINT "CrmActivity_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmActivity"
  ADD CONSTRAINT "CrmActivity_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmActivity"
  ADD CONSTRAINT "CrmActivity_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CrmActivity" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "CrmActivity" FROM anon, authenticated;
