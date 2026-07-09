-- CreateEnum
CREATE TYPE "PortalOrderStatus" AS ENUM ('DRAFT', 'PLACED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PortalPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PortalInvoiceStatus" AS ENUM ('NOT_REQUESTED', 'REQUESTED', 'ISSUED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PortalFulfillmentStatus" AS ENUM ('NOT_STARTED', 'READY_FOR_INPUT', 'INPUT_IN_PROGRESS', 'INPUT_SUBMITTED', 'GENERATION_PENDING', 'GENERATED', 'DELIVERED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "PortalDocumentInputStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'LOCKED', 'GENERATION_PENDING', 'GENERATED', 'NEEDS_CORRECTION', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PortalDownloadChannel" AS ENUM ('CLIENT_PORTAL', 'CRM_SUPPORT');

-- CreateTable
CREATE TABLE "PortalOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "status" "PortalOrderStatus" NOT NULL DEFAULT 'PLACED',
    "paymentStatus" "PortalPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "invoiceStatus" "PortalInvoiceStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
    "currency" TEXT NOT NULL DEFAULT 'PLN',
    "totalNetCents" INTEGER NOT NULL DEFAULT 0,
    "totalVatCents" INTEGER NOT NULL DEFAULT 0,
    "totalGrossCents" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "templateId" TEXT,
    "generatedDocumentId" TEXT,
    "name" TEXT NOT NULL,
    "documentType" "DocumentType",
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitNetCents" INTEGER NOT NULL DEFAULT 0,
    "totalGrossCents" INTEGER NOT NULL DEFAULT 0,
    "fulfillmentStatus" "PortalFulfillmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalDocumentInput" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "templateId" TEXT,
    "documentType" "DocumentType",
    "status" "PortalDocumentInputStatus" NOT NULL DEFAULT 'DRAFT',
    "dataJson" JSONB NOT NULL,
    "validationSummary" JSONB,
    "createdById" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalDocumentInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalDocumentDownload" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "generatedDocumentId" TEXT NOT NULL,
    "downloadedById" TEXT NOT NULL,
    "channel" "PortalDownloadChannel" NOT NULL DEFAULT 'CLIENT_PORTAL',
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalDocumentDownload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortalOrder_orderNumber_key" ON "PortalOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "PortalOrder_organizationId_idx" ON "PortalOrder"("organizationId");

-- CreateIndex
CREATE INDEX "PortalOrder_status_createdAt_idx" ON "PortalOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PortalOrder_paymentStatus_createdAt_idx" ON "PortalOrder"("paymentStatus", "createdAt");

-- CreateIndex
CREATE INDEX "PortalOrder_createdById_idx" ON "PortalOrder"("createdById");

-- CreateIndex
CREATE INDEX "PortalOrderItem_orderId_idx" ON "PortalOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "PortalOrderItem_organizationId_idx" ON "PortalOrderItem"("organizationId");

-- CreateIndex
CREATE INDEX "PortalOrderItem_templateId_idx" ON "PortalOrderItem"("templateId");

-- CreateIndex
CREATE INDEX "PortalOrderItem_generatedDocumentId_idx" ON "PortalOrderItem"("generatedDocumentId");

-- CreateIndex
CREATE INDEX "PortalOrderItem_fulfillmentStatus_idx" ON "PortalOrderItem"("fulfillmentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "PortalDocumentInput_orderItemId_key" ON "PortalDocumentInput"("orderItemId");

-- CreateIndex
CREATE INDEX "PortalDocumentInput_organizationId_idx" ON "PortalDocumentInput"("organizationId");

-- CreateIndex
CREATE INDEX "PortalDocumentInput_templateId_idx" ON "PortalDocumentInput"("templateId");

-- CreateIndex
CREATE INDEX "PortalDocumentInput_status_updatedAt_idx" ON "PortalDocumentInput"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "PortalDocumentInput_createdById_idx" ON "PortalDocumentInput"("createdById");

-- CreateIndex
CREATE INDEX "PortalDocumentDownload_organizationId_createdAt_idx" ON "PortalDocumentDownload"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "PortalDocumentDownload_generatedDocumentId_createdAt_idx" ON "PortalDocumentDownload"("generatedDocumentId", "createdAt");

-- CreateIndex
CREATE INDEX "PortalDocumentDownload_downloadedById_createdAt_idx" ON "PortalDocumentDownload"("downloadedById", "createdAt");

-- AddForeignKey
ALTER TABLE "PortalOrder" ADD CONSTRAINT "PortalOrder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalOrder" ADD CONSTRAINT "PortalOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalOrderItem" ADD CONSTRAINT "PortalOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PortalOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalOrderItem" ADD CONSTRAINT "PortalOrderItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalOrderItem" ADD CONSTRAINT "PortalOrderItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalOrderItem" ADD CONSTRAINT "PortalOrderItem_generatedDocumentId_fkey" FOREIGN KEY ("generatedDocumentId") REFERENCES "GeneratedDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalOrderItem" ADD CONSTRAINT "PortalOrderItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalDocumentInput" ADD CONSTRAINT "PortalDocumentInput_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalDocumentInput" ADD CONSTRAINT "PortalDocumentInput_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "PortalOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalDocumentInput" ADD CONSTRAINT "PortalDocumentInput_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalDocumentInput" ADD CONSTRAINT "PortalDocumentInput_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalDocumentDownload" ADD CONSTRAINT "PortalDocumentDownload_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalDocumentDownload" ADD CONSTRAINT "PortalDocumentDownload_generatedDocumentId_fkey" FOREIGN KEY ("generatedDocumentId") REFERENCES "GeneratedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalDocumentDownload" ADD CONSTRAINT "PortalDocumentDownload_downloadedById_fkey" FOREIGN KEY ("downloadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable RLS for private portal tables in exposed public schema.
ALTER TABLE "PortalOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PortalOrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PortalDocumentInput" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PortalDocumentDownload" ENABLE ROW LEVEL SECURITY;

-- Keep Supabase Data API access closed until explicit policies/grants are reviewed.
REVOKE ALL ON TABLE "PortalOrder" FROM anon, authenticated;
REVOKE ALL ON TABLE "PortalOrderItem" FROM anon, authenticated;
REVOKE ALL ON TABLE "PortalDocumentInput" FROM anon, authenticated;
REVOKE ALL ON TABLE "PortalDocumentDownload" FROM anon, authenticated;
