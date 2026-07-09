CREATE TYPE "DataBreachIncidentStatus" AS ENUM (
  'DRAFT',
  'REPORTED',
  'TRIAGE',
  'RISK_ASSESSMENT',
  'NOTIFICATION_REQUIRED',
  'NOTIFICATION_NOT_REQUIRED',
  'NOTIFIED_AUTHORITY',
  'NOTIFIED_DATA_SUBJECTS',
  'CLOSED',
  'CANCELLED'
);

CREATE TYPE "DataBreachSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "DataBreachRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'UNKNOWN');
CREATE TYPE "DataBreachActivityType" AS ENUM (
  'CREATED',
  'SUBMITTED',
  'UPDATED',
  'STATUS_CHANGED',
  'RISK_ASSESSMENT_UPDATED',
  'NOTIFICATION_DECISION_CHANGED',
  'NOTE_ADDED',
  'TASK_CREATED',
  'CLOSED'
);
CREATE TYPE "DataBreachActivityVisibility" AS ENUM ('INTERNAL', 'PUBLIC');

ALTER TABLE "CrmTask"
  ADD COLUMN "breachIncidentId" TEXT;

ALTER TABLE "CrmTask"
  DROP CONSTRAINT IF EXISTS "CrmTask_has_parent_check";

ALTER TABLE "CrmTask"
  ADD CONSTRAINT "CrmTask_has_parent_check"
  CHECK ("leadId" IS NOT NULL OR "organizationId" IS NOT NULL OR "breachIncidentId" IS NOT NULL);

CREATE TABLE "DataBreachIncident" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "reportedById" TEXT NOT NULL,
  "assignedToId" TEXT,
  "title" TEXT NOT NULL,
  "status" "DataBreachIncidentStatus" NOT NULL DEFAULT 'DRAFT',
  "severity" "DataBreachSeverity" NOT NULL DEFAULT 'MEDIUM',
  "riskLevel" "DataBreachRiskLevel" NOT NULL DEFAULT 'UNKNOWN',
  "occurredAt" TIMESTAMP(3),
  "discoveredAt" TIMESTAMP(3) NOT NULL,
  "reportedAt" TIMESTAMP(3),
  "authorityNotificationDeadlineAt" TIMESTAMP(3) NOT NULL,
  "closedAt" TIMESTAMP(3),
  "description" TEXT NOT NULL,
  "affectedDataCategories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "affectedDataSubjectCategories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "approximateAffectedSubjects" INTEGER,
  "cause" TEXT,
  "consequences" TEXT,
  "measuresTaken" TEXT,
  "measuresPlanned" TEXT,
  "contactName" TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "authorityNotificationRequired" BOOLEAN,
  "dataSubjectsNotificationRequired" BOOLEAN,
  "decisionRationale" TEXT,
  "specialCategoryData" BOOLEAN NOT NULL DEFAULT false,
  "childrenData" BOOLEAN NOT NULL DEFAULT false,
  "largeScale" BOOLEAN NOT NULL DEFAULT false,
  "identityTheftRisk" BOOLEAN NOT NULL DEFAULT false,
  "encryptedData" BOOLEAN NOT NULL DEFAULT false,
  "accessRecovered" BOOLEAN NOT NULL DEFAULT false,
  "mitigationMeasuresApplied" BOOLEAN NOT NULL DEFAULT false,
  "suggestedRiskLevel" "DataBreachRiskLevel",
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DataBreachIncident_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DataBreachActivity" (
  "id" TEXT NOT NULL,
  "incidentId" TEXT NOT NULL,
  "actorId" TEXT,
  "type" "DataBreachActivityType" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT,
  "visibility" "DataBreachActivityVisibility" NOT NULL DEFAULT 'INTERNAL',
  "metadata" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DataBreachActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CrmTask_breachIncidentId_status_idx" ON "CrmTask"("breachIncidentId", "status");
CREATE INDEX "DataBreachIncident_organizationId_status_idx" ON "DataBreachIncident"("organizationId", "status");
CREATE INDEX "DataBreachIncident_reportedById_idx" ON "DataBreachIncident"("reportedById");
CREATE INDEX "DataBreachIncident_assignedToId_idx" ON "DataBreachIncident"("assignedToId");
CREATE INDEX "DataBreachIncident_status_authorityNotificationDeadlineAt_idx" ON "DataBreachIncident"("status", "authorityNotificationDeadlineAt");
CREATE INDEX "DataBreachIncident_riskLevel_severity_idx" ON "DataBreachIncident"("riskLevel", "severity");
CREATE INDEX "DataBreachIncident_createdAt_idx" ON "DataBreachIncident"("createdAt");
CREATE INDEX "DataBreachActivity_incidentId_createdAt_idx" ON "DataBreachActivity"("incidentId", "createdAt");
CREATE INDEX "DataBreachActivity_actorId_idx" ON "DataBreachActivity"("actorId");
CREATE INDEX "DataBreachActivity_visibility_createdAt_idx" ON "DataBreachActivity"("visibility", "createdAt");

ALTER TABLE "DataBreachIncident"
  ADD CONSTRAINT "DataBreachIncident_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataBreachIncident"
  ADD CONSTRAINT "DataBreachIncident_reportedById_fkey"
  FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DataBreachIncident"
  ADD CONSTRAINT "DataBreachIncident_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DataBreachActivity"
  ADD CONSTRAINT "DataBreachActivity_incidentId_fkey"
  FOREIGN KEY ("incidentId") REFERENCES "DataBreachIncident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataBreachActivity"
  ADD CONSTRAINT "DataBreachActivity_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmTask"
  ADD CONSTRAINT "CrmTask_breachIncidentId_fkey"
  FOREIGN KEY ("breachIncidentId") REFERENCES "DataBreachIncident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DataBreachIncident" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataBreachActivity" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "DataBreachIncident" FROM anon, authenticated;
REVOKE ALL ON TABLE "DataBreachActivity" FROM anon, authenticated;
