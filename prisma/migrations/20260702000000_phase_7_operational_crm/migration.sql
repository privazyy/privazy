-- CreateEnum
CREATE TYPE "CrmLeadStatus" AS ENUM ('NEW', 'CONTACT_REQUIRED', 'CONTACTED', 'QUALIFIED', 'OFFER_SENT', 'WON', 'LOST', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CrmPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CrmTaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CrmActivityType" AS ENUM ('NOTE', 'STATUS_CHANGE', 'ASSIGNMENT', 'EMAIL', 'CALL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CrmMessageStatus" AS ENUM ('DRAFT', 'QUEUED', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "BreachIncidentStatus" AS ENUM ('NEW', 'TRIAGE', 'INVESTIGATING', 'RISK_ASSESSMENT', 'NOTIFICATION_REQUIRED', 'NOTIFIED_AUTHORITY', 'NOTIFIED_DATA_SUBJECTS', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BreachRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DataSubjectRequestType" AS ENUM ('ACCESS', 'RECTIFICATION', 'ERASURE', 'RESTRICTION', 'PORTABILITY', 'OBJECTION', 'CONSENT_WITHDRAWAL', 'OTHER');

-- CreateEnum
CREATE TYPE "DataSubjectRequestStatus" AS ENUM ('NEW', 'IDENTITY_VERIFICATION', 'IN_PROGRESS', 'WAITING_FOR_CLIENT', 'READY_FOR_REVIEW', 'RESPONDED', 'CLOSED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "CrmLead" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "formSubmissionId" TEXT,
    "ownerId" TEXT,
    "status" "CrmLeadStatus" NOT NULL DEFAULT 'NEW',
    "priority" "CrmPriority" NOT NULL DEFAULT 'MEDIUM',
    "source" TEXT,
    "utm" JSONB,
    "valueCents" INTEGER NOT NULL DEFAULT 0,
    "lostReason" TEXT,
    "lastContactedAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "wonAt" TIMESTAMP(3),
    "lostAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmTask" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "ownerId" TEXT,
    "createdById" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CrmTaskStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "CrmPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmNote" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdById" TEXT,
    "body" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmActivity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "actorId" TEXT,
    "type" "CrmActivityType" NOT NULL DEFAULT 'SYSTEM',
    "action" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmMessage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdById" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "fromEmail" TEXT,
    "toEmail" TEXT NOT NULL,
    "status" "CrmMessageStatus" NOT NULL DEFAULT 'DRAFT',
    "entityType" TEXT,
    "entityId" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmCalendarEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "ownerId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmCalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreachIncident" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "incidentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "status" "BreachIncidentStatus" NOT NULL DEFAULT 'NEW',
    "riskLevel" "BreachRiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "occurredAt" TIMESTAMP(3),
    "authorityDueAt" TIMESTAMP(3),
    "dataSubjectsDueAt" TIMESTAMP(3),
    "assignedToId" TEXT,
    "createdById" TEXT,
    "notifyAuthority" BOOLEAN,
    "notifyDataSubjects" BOOLEAN,
    "decisionNotes" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreachIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSubjectRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "type" "DataSubjectRequestType" NOT NULL,
    "status" "DataSubjectRequestStatus" NOT NULL DEFAULT 'NEW',
    "subjectName" TEXT NOT NULL,
    "subjectEmail" TEXT,
    "channel" TEXT NOT NULL,
    "summary" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "assignedToId" TEXT,
    "createdById" TEXT,
    "responseSummary" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataSubjectRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrmLead_formSubmissionId_key" ON "CrmLead"("formSubmissionId");

-- CreateIndex
CREATE INDEX "CrmLead_organizationId_idx" ON "CrmLead"("organizationId");

-- CreateIndex
CREATE INDEX "CrmLead_ownerId_idx" ON "CrmLead"("ownerId");

-- CreateIndex
CREATE INDEX "CrmLead_status_idx" ON "CrmLead"("status");

-- CreateIndex
CREATE INDEX "CrmLead_priority_idx" ON "CrmLead"("priority");

-- CreateIndex
CREATE INDEX "CrmLead_nextFollowUpAt_idx" ON "CrmLead"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "CrmTask_organizationId_idx" ON "CrmTask"("organizationId");

-- CreateIndex
CREATE INDEX "CrmTask_ownerId_idx" ON "CrmTask"("ownerId");

-- CreateIndex
CREATE INDEX "CrmTask_createdById_idx" ON "CrmTask"("createdById");

-- CreateIndex
CREATE INDEX "CrmTask_status_idx" ON "CrmTask"("status");

-- CreateIndex
CREATE INDEX "CrmTask_priority_idx" ON "CrmTask"("priority");

-- CreateIndex
CREATE INDEX "CrmTask_dueAt_idx" ON "CrmTask"("dueAt");

-- CreateIndex
CREATE INDEX "CrmTask_entityType_entityId_idx" ON "CrmTask"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "CrmNote_organizationId_idx" ON "CrmNote"("organizationId");

-- CreateIndex
CREATE INDEX "CrmNote_createdById_idx" ON "CrmNote"("createdById");

-- CreateIndex
CREATE INDEX "CrmNote_entityType_entityId_idx" ON "CrmNote"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "CrmNote_createdAt_idx" ON "CrmNote"("createdAt");

-- CreateIndex
CREATE INDEX "CrmActivity_organizationId_idx" ON "CrmActivity"("organizationId");

-- CreateIndex
CREATE INDEX "CrmActivity_actorId_idx" ON "CrmActivity"("actorId");

-- CreateIndex
CREATE INDEX "CrmActivity_type_idx" ON "CrmActivity"("type");

-- CreateIndex
CREATE INDEX "CrmActivity_entityType_entityId_idx" ON "CrmActivity"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "CrmActivity_createdAt_idx" ON "CrmActivity"("createdAt");

-- CreateIndex
CREATE INDEX "CrmMessage_organizationId_idx" ON "CrmMessage"("organizationId");

-- CreateIndex
CREATE INDEX "CrmMessage_createdById_idx" ON "CrmMessage"("createdById");

-- CreateIndex
CREATE INDEX "CrmMessage_status_idx" ON "CrmMessage"("status");

-- CreateIndex
CREATE INDEX "CrmMessage_entityType_entityId_idx" ON "CrmMessage"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "CrmMessage_createdAt_idx" ON "CrmMessage"("createdAt");

-- CreateIndex
CREATE INDEX "CrmCalendarEvent_organizationId_idx" ON "CrmCalendarEvent"("organizationId");

-- CreateIndex
CREATE INDEX "CrmCalendarEvent_ownerId_idx" ON "CrmCalendarEvent"("ownerId");

-- CreateIndex
CREATE INDEX "CrmCalendarEvent_startsAt_idx" ON "CrmCalendarEvent"("startsAt");

-- CreateIndex
CREATE INDEX "CrmCalendarEvent_entityType_entityId_idx" ON "CrmCalendarEvent"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "BreachIncident_incidentNumber_key" ON "BreachIncident"("incidentNumber");

-- CreateIndex
CREATE INDEX "BreachIncident_organizationId_idx" ON "BreachIncident"("organizationId");

-- CreateIndex
CREATE INDEX "BreachIncident_status_idx" ON "BreachIncident"("status");

-- CreateIndex
CREATE INDEX "BreachIncident_riskLevel_idx" ON "BreachIncident"("riskLevel");

-- CreateIndex
CREATE INDEX "BreachIncident_authorityDueAt_idx" ON "BreachIncident"("authorityDueAt");

-- CreateIndex
CREATE INDEX "BreachIncident_assignedToId_idx" ON "BreachIncident"("assignedToId");

-- CreateIndex
CREATE UNIQUE INDEX "DataSubjectRequest_requestNumber_key" ON "DataSubjectRequest"("requestNumber");

-- CreateIndex
CREATE INDEX "DataSubjectRequest_organizationId_idx" ON "DataSubjectRequest"("organizationId");

-- CreateIndex
CREATE INDEX "DataSubjectRequest_type_idx" ON "DataSubjectRequest"("type");

-- CreateIndex
CREATE INDEX "DataSubjectRequest_status_idx" ON "DataSubjectRequest"("status");

-- CreateIndex
CREATE INDEX "DataSubjectRequest_dueAt_idx" ON "DataSubjectRequest"("dueAt");

-- CreateIndex
CREATE INDEX "DataSubjectRequest_assignedToId_idx" ON "DataSubjectRequest"("assignedToId");

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmNote" ADD CONSTRAINT "CrmNote_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmNote" ADD CONSTRAINT "CrmNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmMessage" ADD CONSTRAINT "CrmMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmMessage" ADD CONSTRAINT "CrmMessage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmCalendarEvent" ADD CONSTRAINT "CrmCalendarEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmCalendarEvent" ADD CONSTRAINT "CrmCalendarEvent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreachIncident" ADD CONSTRAINT "BreachIncident_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreachIncident" ADD CONSTRAINT "BreachIncident_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreachIncident" ADD CONSTRAINT "BreachIncident_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSubjectRequest" ADD CONSTRAINT "DataSubjectRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSubjectRequest" ADD CONSTRAINT "DataSubjectRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSubjectRequest" ADD CONSTRAINT "DataSubjectRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
