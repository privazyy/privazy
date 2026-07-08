CREATE TYPE "LeadSource" AS ENUM ('IOD_CHECKER', 'CONTACT_FORM', 'MANUAL', 'WEBSITE', 'REFERRAL', 'OTHER');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'TO_CONTACT', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'PROPOSAL_SENT', 'CONVERTED', 'WON', 'LOST', 'ARCHIVED');
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "OrganizationStatus" AS ENUM ('PROSPECT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "CrmNoteVisibility" AS ENUM ('INTERNAL');
CREATE TYPE "CrmTaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED');

ALTER TABLE "Organization"
  ADD COLUMN "legalName" TEXT,
  ADD COLUMN "industry" TEXT,
  ADD COLUMN "size" TEXT,
  ADD COLUMN "status" "OrganizationStatus" NOT NULL DEFAULT 'PROSPECT',
  ADD COLUMN "ownerId" TEXT;

CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "source" "LeadSource" NOT NULL DEFAULT 'MANUAL',
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "priority" "LeadPriority" NOT NULL DEFAULT 'NORMAL',
  "companyName" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "nip" TEXT,
  "industry" TEXT,
  "companySize" TEXT,
  "estimatedValue" DECIMAL(12,2),
  "consentMarketing" BOOLEAN NOT NULL DEFAULT false,
  "consentPrivacy" BOOLEAN NOT NULL DEFAULT false,
  "consentContact" BOOLEAN NOT NULL DEFAULT false,
  "iodCheckerResult" TEXT,
  "iodCheckerAnswersSnapshot" JSONB,
  "sourceDetails" JSONB,
  "assignedToId" TEXT,
  "organizationId" TEXT,
  "formSubmissionId" TEXT,
  "convertedAt" TIMESTAMP(3),
  "lastContactedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactPerson" (
  "id" TEXT NOT NULL,
  "leadId" TEXT,
  "organizationId" TEXT,
  "fullName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "role" TEXT,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContactPerson_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContactPerson_has_parent_check" CHECK ("leadId" IS NOT NULL OR "organizationId" IS NOT NULL)
);

CREATE TABLE "CrmNote" (
  "id" TEXT NOT NULL,
  "leadId" TEXT,
  "organizationId" TEXT,
  "authorId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "visibility" "CrmNoteVisibility" NOT NULL DEFAULT 'INTERNAL',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CrmNote_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CrmNote_has_parent_check" CHECK ("leadId" IS NOT NULL OR "organizationId" IS NOT NULL)
);

CREATE TABLE "CrmTask" (
  "id" TEXT NOT NULL,
  "leadId" TEXT,
  "organizationId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "CrmTaskStatus" NOT NULL DEFAULT 'OPEN',
  "priority" "LeadPriority" NOT NULL DEFAULT 'NORMAL',
  "dueAt" TIMESTAMP(3),
  "assignedToId" TEXT,
  "createdById" TEXT NOT NULL,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CrmTask_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CrmTask_has_parent_check" CHECK ("leadId" IS NOT NULL OR "organizationId" IS NOT NULL)
);

CREATE UNIQUE INDEX "Lead_formSubmissionId_key" ON "Lead"("formSubmissionId");
CREATE INDEX "Organization_ownerId_idx" ON "Organization"("ownerId");
CREATE INDEX "Organization_status_createdAt_idx" ON "Organization"("status", "createdAt");
CREATE INDEX "Organization_name_idx" ON "Organization"("name");
CREATE INDEX "Organization_nip_idx" ON "Organization"("nip");
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
CREATE INDEX "Lead_source_createdAt_idx" ON "Lead"("source", "createdAt");
CREATE INDEX "Lead_priority_createdAt_idx" ON "Lead"("priority", "createdAt");
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");
CREATE INDEX "Lead_organizationId_idx" ON "Lead"("organizationId");
CREATE INDEX "Lead_email_idx" ON "Lead"("email");
CREATE INDEX "Lead_companyName_idx" ON "Lead"("companyName");
CREATE INDEX "Lead_nip_idx" ON "Lead"("nip");
CREATE INDEX "ContactPerson_leadId_idx" ON "ContactPerson"("leadId");
CREATE INDEX "ContactPerson_organizationId_idx" ON "ContactPerson"("organizationId");
CREATE INDEX "ContactPerson_email_idx" ON "ContactPerson"("email");
CREATE INDEX "CrmNote_leadId_createdAt_idx" ON "CrmNote"("leadId", "createdAt");
CREATE INDEX "CrmNote_organizationId_createdAt_idx" ON "CrmNote"("organizationId", "createdAt");
CREATE INDEX "CrmNote_authorId_idx" ON "CrmNote"("authorId");
CREATE INDEX "CrmTask_leadId_status_idx" ON "CrmTask"("leadId", "status");
CREATE INDEX "CrmTask_organizationId_status_idx" ON "CrmTask"("organizationId", "status");
CREATE INDEX "CrmTask_assignedToId_status_dueAt_idx" ON "CrmTask"("assignedToId", "status", "dueAt");
CREATE INDEX "CrmTask_createdById_idx" ON "CrmTask"("createdById");
CREATE INDEX "CrmTask_dueAt_idx" ON "CrmTask"("dueAt");

ALTER TABLE "Organization"
  ADD CONSTRAINT "Organization_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead"
  ADD CONSTRAINT "Lead_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead"
  ADD CONSTRAINT "Lead_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead"
  ADD CONSTRAINT "Lead_formSubmissionId_fkey"
  FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContactPerson"
  ADD CONSTRAINT "ContactPerson_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContactPerson"
  ADD CONSTRAINT "ContactPerson_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmNote"
  ADD CONSTRAINT "CrmNote_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmNote"
  ADD CONSTRAINT "CrmNote_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmNote"
  ADD CONSTRAINT "CrmNote_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CrmTask"
  ADD CONSTRAINT "CrmTask_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmTask"
  ADD CONSTRAINT "CrmTask_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmTask"
  ADD CONSTRAINT "CrmTask_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmTask"
  ADD CONSTRAINT "CrmTask_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactPerson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CrmNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CrmTask" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FormSubmission" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "Lead" FROM anon, authenticated;
REVOKE ALL ON TABLE "ContactPerson" FROM anon, authenticated;
REVOKE ALL ON TABLE "CrmNote" FROM anon, authenticated;
REVOKE ALL ON TABLE "CrmTask" FROM anon, authenticated;
REVOKE ALL ON TABLE "Organization" FROM anon, authenticated;
REVOKE ALL ON TABLE "FormSubmission" FROM anon, authenticated;
