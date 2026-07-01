-- CreateEnum
CREATE TYPE "ClientOrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'BILLING');

-- CreateEnum
CREATE TYPE "ClientMessageThreadStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ClientMessageSenderType" AS ENUM ('CLIENT', 'PRIVAZY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ClientTimelineEventType" AS ENUM ('BREACH_CREATED', 'REQUEST_CREATED', 'DOCUMENT_FORM_SUBMITTED', 'DOCUMENT_DOWNLOADED', 'MESSAGE_SENT', 'TASK_COMPLETED', 'ORGANIZATION_UPDATED', 'SYSTEM');

-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "invitedAt" TIMESTAMP(3),
ADD COLUMN     "role" "ClientOrganizationRole" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "FormSubmission" ADD COLUMN     "orderItemId" TEXT;

-- CreateTable
CREATE TABLE "DocumentDownload" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "generatedDocumentId" TEXT NOT NULL,
    "userId" TEXT,
    "fileType" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientTimelineEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" "ClientTimelineEventType" NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "body" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientMessageThread" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "subject" TEXT NOT NULL,
    "status" "ClientMessageThreadStatus" NOT NULL DEFAULT 'OPEN',
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientMessageThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "senderUserId" TEXT,
    "senderType" "ClientMessageSenderType" NOT NULL,
    "body" TEXT NOT NULL,
    "attachmentKeys" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentDownload_organizationId_idx" ON "DocumentDownload"("organizationId");

-- CreateIndex
CREATE INDEX "DocumentDownload_generatedDocumentId_idx" ON "DocumentDownload"("generatedDocumentId");

-- CreateIndex
CREATE INDEX "DocumentDownload_userId_idx" ON "DocumentDownload"("userId");

-- CreateIndex
CREATE INDEX "DocumentDownload_createdAt_idx" ON "DocumentDownload"("createdAt");

-- CreateIndex
CREATE INDEX "ClientTimelineEvent_organizationId_idx" ON "ClientTimelineEvent"("organizationId");

-- CreateIndex
CREATE INDEX "ClientTimelineEvent_actorId_idx" ON "ClientTimelineEvent"("actorId");

-- CreateIndex
CREATE INDEX "ClientTimelineEvent_type_idx" ON "ClientTimelineEvent"("type");

-- CreateIndex
CREATE INDEX "ClientTimelineEvent_entityType_entityId_idx" ON "ClientTimelineEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ClientTimelineEvent_createdAt_idx" ON "ClientTimelineEvent"("createdAt");

-- CreateIndex
CREATE INDEX "ClientMessageThread_organizationId_idx" ON "ClientMessageThread"("organizationId");

-- CreateIndex
CREATE INDEX "ClientMessageThread_createdById_idx" ON "ClientMessageThread"("createdById");

-- CreateIndex
CREATE INDEX "ClientMessageThread_status_idx" ON "ClientMessageThread"("status");

-- CreateIndex
CREATE INDEX "ClientMessageThread_relatedEntityType_relatedEntityId_idx" ON "ClientMessageThread"("relatedEntityType", "relatedEntityId");

-- CreateIndex
CREATE INDEX "ClientMessageThread_lastMessageAt_idx" ON "ClientMessageThread"("lastMessageAt");

-- CreateIndex
CREATE INDEX "ClientMessage_threadId_idx" ON "ClientMessage"("threadId");

-- CreateIndex
CREATE INDEX "ClientMessage_organizationId_idx" ON "ClientMessage"("organizationId");

-- CreateIndex
CREATE INDEX "ClientMessage_senderUserId_idx" ON "ClientMessage"("senderUserId");

-- CreateIndex
CREATE INDEX "ClientMessage_senderType_idx" ON "ClientMessage"("senderType");

-- CreateIndex
CREATE INDEX "ClientMessage_createdAt_idx" ON "ClientMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ClientProfile_role_idx" ON "ClientProfile"("role");

-- CreateIndex
CREATE INDEX "FormSubmission_orderItemId_idx" ON "FormSubmission"("orderItemId");

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_generatedDocumentId_fkey" FOREIGN KEY ("generatedDocumentId") REFERENCES "GeneratedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTimelineEvent" ADD CONSTRAINT "ClientTimelineEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTimelineEvent" ADD CONSTRAINT "ClientTimelineEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMessageThread" ADD CONSTRAINT "ClientMessageThread_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMessageThread" ADD CONSTRAINT "ClientMessageThread_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMessage" ADD CONSTRAINT "ClientMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ClientMessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMessage" ADD CONSTRAINT "ClientMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMessage" ADD CONSTRAINT "ClientMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
