-- CreateEnum
CREATE TYPE "DocumentDownloadSource" AS ENUM ('CLIENT_PORTAL', 'CRM', 'API');

-- CreateTable
CREATE TABLE "DocumentDownload" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "generatedDocumentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actorRole" "UserRole" NOT NULL,
    "source" "DocumentDownloadSource" NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,
    "userAgentHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentDownload_pkey" PRIMARY KEY ("id")
);

-- Keep the audit table unavailable to Supabase Data API roles. Application
-- access is server-side through the trusted Prisma runtime connection.
ALTER TABLE "DocumentDownload" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "DocumentDownload" FROM PUBLIC;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON TABLE "DocumentDownload" FROM anon;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        REVOKE ALL ON TABLE "DocumentDownload" FROM authenticated;
    END IF;
END
$$;

-- CreateIndex
CREATE INDEX "DocumentDownload_fileId_idx" ON "DocumentDownload"("fileId");

-- CreateIndex
CREATE INDEX "DocumentDownload_generatedDocumentId_idx" ON "DocumentDownload"("generatedDocumentId");

-- CreateIndex
CREATE INDEX "DocumentDownload_organizationId_idx" ON "DocumentDownload"("organizationId");

-- CreateIndex
CREATE INDEX "DocumentDownload_userId_idx" ON "DocumentDownload"("userId");

-- CreateIndex
CREATE INDEX "DocumentDownload_downloadedAt_idx" ON "DocumentDownload"("downloadedAt");

-- AddForeignKey
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_generatedDocumentId_fkey" FOREIGN KEY ("generatedDocumentId") REFERENCES "GeneratedDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
