-- CreateEnum
CREATE TYPE "DocumentTemplateSource" AS ENUM ('R2', 'LOCAL_DEVELOPMENT_SAMPLE');

-- CreateEnum
CREATE TYPE "DocumentInputStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'GENERATING', 'READY', 'FAILED', 'REVIEW_REQUIRED', 'REVIEWED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GeneratedFileType" AS ENUM ('DOCX', 'PDF', 'HTML', 'ZIP');

-- CreateEnum
CREATE TYPE "DocumentReviewStatus" AS ENUM ('NOT_REQUIRED', 'REQUIRED', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProductKind" AS ENUM ('DOCUMENT', 'SERVICE', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'PAID', 'MANUALLY_APPROVED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('INPUT_REQUIRED', 'DRAFT', 'SUBMITTED', 'GENERATING', 'READY', 'FAILED', 'REVIEW_REQUIRED', 'REVIEWED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "GeneratedDocumentStatus_new" AS ENUM ('PROCESSING', 'READY', 'FAILED', 'REVIEW_REQUIRED', 'ARCHIVED');
ALTER TABLE "GeneratedDocument" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "GeneratedDocument" ALTER COLUMN "status" TYPE "GeneratedDocumentStatus_new" USING (
  CASE "status"::text
    WHEN 'DRAFT' THEN 'PROCESSING'
    WHEN 'GENERATED' THEN 'READY'
    WHEN 'DELIVERED' THEN 'READY'
    WHEN 'ARCHIVED' THEN 'ARCHIVED'
    ELSE 'FAILED'
  END::"GeneratedDocumentStatus_new"
);
ALTER TYPE "GeneratedDocumentStatus" RENAME TO "GeneratedDocumentStatus_old";
ALTER TYPE "GeneratedDocumentStatus_new" RENAME TO "GeneratedDocumentStatus";
DROP TYPE "GeneratedDocumentStatus_old";
ALTER TABLE "GeneratedDocument" ALTER COLUMN "status" SET DEFAULT 'PROCESSING';
COMMIT;

-- DropForeignKey
ALTER TABLE "DocumentGenerationJob" DROP CONSTRAINT "DocumentGenerationJob_templateId_fkey";

-- DropForeignKey
ALTER TABLE "GeneratedDocument" DROP CONSTRAINT "GeneratedDocument_templateId_fkey";

-- DropForeignKey
ALTER TABLE "GeneratedDocument" DROP CONSTRAINT "GeneratedDocument_generationJobId_fkey";

-- AlterTable
ALTER TABLE "DocumentTemplate" ADD COLUMN     "isSample" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiresReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" "DocumentTemplateSource" NOT NULL DEFAULT 'R2',
ALTER COLUMN "fileKey" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DocumentGenerationJob" ADD COLUMN     "attempt" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "documentInputId" TEXT,
ADD COLUMN     "orderItemId" TEXT,
ADD COLUMN     "safeErrorMessage" TEXT,
ALTER COLUMN "templateId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "GeneratedDocument" ADD COLUMN     "documentInputId" TEXT,
ADD COLUMN     "orderItemId" TEXT,
ADD COLUMN     "reviewStatus" "DocumentReviewStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
ALTER COLUMN "templateId" DROP NOT NULL,
ALTER COLUMN "generationJobId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PROCESSING',
ALTER COLUMN "docxFileKey" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "ProductKind" NOT NULL DEFAULT 'DOCUMENT',
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "documentType" "DocumentType",
    "templateId" TEXT,
    "requiresReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "currency" TEXT NOT NULL DEFAULT 'PLN',
    "totalNet" INTEGER NOT NULL DEFAULT 0,
    "totalGross" INTEGER NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "manuallyApprovedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "kind" "ProductKind" NOT NULL DEFAULT 'DOCUMENT',
    "documentType" "DocumentType",
    "status" "OrderItemStatus" NOT NULL DEFAULT 'INPUT_REQUIRED',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitNet" INTEGER NOT NULL DEFAULT 0,
    "unitGross" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'sandbox',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PLN',
    "reference" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "number" TEXT,
    "fileKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentInput" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "templateId" TEXT,
    "createdById" TEXT NOT NULL,
    "status" "DocumentInputStatus" NOT NULL DEFAULT 'DRAFT',
    "documentType" "DocumentType" NOT NULL DEFAULT 'PRIVACY_POLICY',
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedDocumentFile" (
    "id" TEXT NOT NULL,
    "generatedDocumentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "GeneratedFileType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "byteSize" INTEGER,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedDocumentFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentDownload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "generatedDocumentId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "DocumentDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentReview" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "generatedDocumentId" TEXT NOT NULL,
    "status" "DocumentReviewStatus" NOT NULL DEFAULT 'REQUIRED',
    "reviewerId" TEXT,
    "reviewComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_organizationId_idx" ON "Product"("organizationId");

-- CreateIndex
CREATE INDEX "Product_kind_status_idx" ON "Product"("kind", "status");

-- CreateIndex
CREATE INDEX "Product_documentType_idx" ON "Product"("documentType");

-- CreateIndex
CREATE INDEX "Order_organizationId_idx" ON "Order"("organizationId");

-- CreateIndex
CREATE INDEX "Order_createdById_idx" ON "Order"("createdById");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_organizationId_idx" ON "OrderItem"("organizationId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderItem_status_idx" ON "OrderItem"("status");

-- CreateIndex
CREATE INDEX "OrderItem_documentType_idx" ON "OrderItem"("documentType");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Invoice_orderId_idx" ON "Invoice"("orderId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "DocumentInput_organizationId_idx" ON "DocumentInput"("organizationId");

-- CreateIndex
CREATE INDEX "DocumentInput_createdById_idx" ON "DocumentInput"("createdById");

-- CreateIndex
CREATE INDEX "DocumentInput_status_idx" ON "DocumentInput"("status");

-- CreateIndex
CREATE INDEX "DocumentInput_documentType_idx" ON "DocumentInput"("documentType");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentInput_orderItemId_version_key" ON "DocumentInput"("orderItemId", "version");

-- CreateIndex
CREATE INDEX "GeneratedDocumentFile_organizationId_idx" ON "GeneratedDocumentFile"("organizationId");

-- CreateIndex
CREATE INDEX "GeneratedDocumentFile_type_idx" ON "GeneratedDocumentFile"("type");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedDocumentFile_generatedDocumentId_type_key" ON "GeneratedDocumentFile"("generatedDocumentId", "type");

-- CreateIndex
CREATE INDEX "DocumentDownload_userId_idx" ON "DocumentDownload"("userId");

-- CreateIndex
CREATE INDEX "DocumentDownload_organizationId_idx" ON "DocumentDownload"("organizationId");

-- CreateIndex
CREATE INDEX "DocumentDownload_generatedDocumentId_idx" ON "DocumentDownload"("generatedDocumentId");

-- CreateIndex
CREATE INDEX "DocumentDownload_fileId_idx" ON "DocumentDownload"("fileId");

-- CreateIndex
CREATE INDEX "DocumentDownload_downloadedAt_idx" ON "DocumentDownload"("downloadedAt");

-- CreateIndex
CREATE INDEX "DocumentReview_organizationId_idx" ON "DocumentReview"("organizationId");

-- CreateIndex
CREATE INDEX "DocumentReview_generatedDocumentId_idx" ON "DocumentReview"("generatedDocumentId");

-- CreateIndex
CREATE INDEX "DocumentReview_reviewerId_idx" ON "DocumentReview"("reviewerId");

-- CreateIndex
CREATE INDEX "DocumentReview_status_idx" ON "DocumentReview"("status");

-- CreateIndex
CREATE INDEX "DocumentGenerationJob_documentInputId_idx" ON "DocumentGenerationJob"("documentInputId");

-- CreateIndex
CREATE INDEX "DocumentGenerationJob_orderItemId_idx" ON "DocumentGenerationJob"("orderItemId");

-- CreateIndex
CREATE INDEX "GeneratedDocument_orderItemId_idx" ON "GeneratedDocument"("orderItemId");

-- CreateIndex
CREATE INDEX "GeneratedDocument_documentInputId_idx" ON "GeneratedDocument"("documentInputId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentGenerationJob" ADD CONSTRAINT "DocumentGenerationJob_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentGenerationJob" ADD CONSTRAINT "DocumentGenerationJob_documentInputId_fkey" FOREIGN KEY ("documentInputId") REFERENCES "DocumentInput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentGenerationJob" ADD CONSTRAINT "DocumentGenerationJob_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_documentInputId_fkey" FOREIGN KEY ("documentInputId") REFERENCES "DocumentInput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "DocumentGenerationJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocumentFile" ADD CONSTRAINT "GeneratedDocumentFile_generatedDocumentId_fkey" FOREIGN KEY ("generatedDocumentId") REFERENCES "GeneratedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_generatedDocumentId_fkey" FOREIGN KEY ("generatedDocumentId") REFERENCES "GeneratedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "GeneratedDocumentFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentReview" ADD CONSTRAINT "DocumentReview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentReview" ADD CONSTRAINT "DocumentReview_generatedDocumentId_fkey" FOREIGN KEY ("generatedDocumentId") REFERENCES "GeneratedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentReview" ADD CONSTRAINT "DocumentReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
