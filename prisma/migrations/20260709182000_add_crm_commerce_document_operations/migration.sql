CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "ProductKind" AS ENUM ('DOCUMENT', 'PACKAGE', 'SERVICE');
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PLACED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
CREATE TYPE "FulfillmentStatus" AS ENUM ('WAITING_FOR_PAYMENT', 'WAITING_FOR_INPUT', 'IN_PROGRESS', 'IN_REVIEW', 'READY', 'DELIVERED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentProvider" AS ENUM ('MOCK', 'SANDBOX');
CREATE TYPE "PaymentReviewStatus" AS ENUM ('UNREVIEWED', 'REVIEWED', 'FLAGGED');
CREATE TYPE "InvoiceStatus" AS ENUM ('NOT_REQUESTED', 'REQUESTED', 'ISSUED', 'FAILED', 'CANCELLED');
CREATE TYPE "InvoiceMode" AS ENUM ('MOCK', 'SANDBOX');
CREATE TYPE "DocumentInputStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED');
CREATE TYPE "GeneratedDocumentReviewStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "DocumentDownloadChannel" AS ENUM ('STAFF', 'CLIENT', 'SECURE_LINK');

ALTER TABLE "DocumentGenerationJob"
  ADD COLUMN "orderId" TEXT,
  ADD COLUMN "orderItemId" TEXT,
  ADD COLUMN "documentInputId" TEXT,
  ADD COLUMN "retryCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "GeneratedDocument"
  ADD COLUMN "orderId" TEXT,
  ADD COLUMN "orderItemId" TEXT,
  ADD COLUMN "reviewStatus" "GeneratedDocumentReviewStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "reviewedById" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3),
  ADD COLUMN "reviewNote" TEXT;

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "kind" "ProductKind" NOT NULL DEFAULT 'DOCUMENT',
  "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
  "documentType" "DocumentType",
  "priceCents" INTEGER NOT NULL,
  "vatRateBps" INTEGER NOT NULL DEFAULT 2300,
  "currency" TEXT NOT NULL DEFAULT 'PLN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "orderNumber" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "leadId" TEXT,
  "ownerId" TEXT,
  "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
  "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'WAITING_FOR_PAYMENT',
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "invoiceStatus" "InvoiceStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
  "customerEmail" TEXT NOT NULL,
  "buyerName" TEXT NOT NULL,
  "buyerTaxId" TEXT,
  "billingAddress" JSONB,
  "totalNetCents" INTEGER NOT NULL,
  "totalVatCents" INTEGER NOT NULL,
  "totalGrossCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'PLN',
  "source" TEXT NOT NULL DEFAULT 'CRM',
  "internalNote" TEXT,
  "cancelledAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "name" TEXT NOT NULL,
  "documentType" "DocumentType",
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitNetCents" INTEGER NOT NULL,
  "vatRateBps" INTEGER NOT NULL DEFAULT 2300,
  "totalNetCents" INTEGER NOT NULL,
  "totalVatCents" INTEGER NOT NULL,
  "totalGrossCents" INTEGER NOT NULL,
  "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'WAITING_FOR_INPUT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "provider" "PaymentProvider" NOT NULL DEFAULT 'MOCK',
  "providerPaymentId" TEXT,
  "mode" "InvoiceMode" NOT NULL DEFAULT 'MOCK',
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "reviewStatus" "PaymentReviewStatus" NOT NULL DEFAULT 'UNREVIEWED',
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'PLN',
  "idempotencyKey" TEXT,
  "payloadHash" TEXT,
  "safeError" TEXT,
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentEvent" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "status" "PaymentStatus" NOT NULL,
  "payloadHash" TEXT,
  "safeSummary" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "invoiceNumber" TEXT,
  "status" "InvoiceStatus" NOT NULL DEFAULT 'REQUESTED',
  "mode" "InvoiceMode" NOT NULL DEFAULT 'MOCK',
  "buyerName" TEXT NOT NULL,
  "buyerTaxId" TEXT,
  "buyerEmail" TEXT,
  "totalNetCents" INTEGER NOT NULL,
  "totalVatCents" INTEGER NOT NULL,
  "totalGrossCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'PLN',
  "providerRef" TEXT,
  "externalUrl" TEXT,
  "payloadHash" TEXT,
  "safeError" TEXT,
  "requestedById" TEXT,
  "issuedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentInput" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "orderId" TEXT,
  "orderItemId" TEXT,
  "status" "DocumentInputStatus" NOT NULL DEFAULT 'DRAFT',
  "data" JSONB NOT NULL,
  "submittedById" TEXT,
  "submittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DocumentInput_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GeneratedDocumentFile" (
  "id" TEXT NOT NULL,
  "generatedDocumentId" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "fileKey" TEXT NOT NULL,
  "fileName" TEXT,
  "contentType" TEXT,
  "sizeBytes" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GeneratedDocumentFile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentDownload" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "generatedDocumentId" TEXT,
  "fileId" TEXT,
  "channel" "DocumentDownloadChannel" NOT NULL DEFAULT 'STAFF',
  "downloadedById" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DocumentDownload_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Product_status_kind_idx" ON "Product"("status", "kind");
CREATE INDEX "Product_documentType_idx" ON "Product"("documentType");
CREATE INDEX "Order_organizationId_createdAt_idx" ON "Order"("organizationId", "createdAt");
CREATE INDEX "Order_leadId_idx" ON "Order"("leadId");
CREATE INDEX "Order_ownerId_idx" ON "Order"("ownerId");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX "Order_paymentStatus_createdAt_idx" ON "Order"("paymentStatus", "createdAt");
CREATE INDEX "Order_invoiceStatus_createdAt_idx" ON "Order"("invoiceStatus", "createdAt");
CREATE INDEX "Order_fulfillmentStatus_createdAt_idx" ON "Order"("fulfillmentStatus", "createdAt");
CREATE INDEX "Order_customerEmail_idx" ON "Order"("customerEmail");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX "OrderItem_documentType_idx" ON "OrderItem"("documentType");
CREATE INDEX "OrderItem_fulfillmentStatus_idx" ON "OrderItem"("fulfillmentStatus");
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");
CREATE INDEX "Payment_reviewStatus_idx" ON "Payment"("reviewStatus");
CREATE INDEX "Payment_provider_providerPaymentId_idx" ON "Payment"("provider", "providerPaymentId");
CREATE INDEX "PaymentEvent_paymentId_createdAt_idx" ON "PaymentEvent"("paymentId", "createdAt");
CREATE INDEX "PaymentEvent_eventType_idx" ON "PaymentEvent"("eventType");
CREATE INDEX "Invoice_orderId_idx" ON "Invoice"("orderId");
CREATE INDEX "Invoice_status_createdAt_idx" ON "Invoice"("status", "createdAt");
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");
CREATE INDEX "DocumentInput_organizationId_createdAt_idx" ON "DocumentInput"("organizationId", "createdAt");
CREATE INDEX "DocumentInput_orderId_idx" ON "DocumentInput"("orderId");
CREATE INDEX "DocumentInput_orderItemId_idx" ON "DocumentInput"("orderItemId");
CREATE INDEX "DocumentInput_status_idx" ON "DocumentInput"("status");
CREATE INDEX "GeneratedDocumentFile_generatedDocumentId_idx" ON "GeneratedDocumentFile"("generatedDocumentId");
CREATE INDEX "DocumentDownload_organizationId_createdAt_idx" ON "DocumentDownload"("organizationId", "createdAt");
CREATE INDEX "DocumentDownload_generatedDocumentId_idx" ON "DocumentDownload"("generatedDocumentId");
CREATE INDEX "DocumentDownload_fileId_idx" ON "DocumentDownload"("fileId");
CREATE INDEX "DocumentDownload_downloadedById_idx" ON "DocumentDownload"("downloadedById");
CREATE INDEX "DocumentGenerationJob_orderId_idx" ON "DocumentGenerationJob"("orderId");
CREATE INDEX "DocumentGenerationJob_orderItemId_idx" ON "DocumentGenerationJob"("orderItemId");
CREATE INDEX "DocumentGenerationJob_documentInputId_idx" ON "DocumentGenerationJob"("documentInputId");
CREATE INDEX "GeneratedDocument_orderId_idx" ON "GeneratedDocument"("orderId");
CREATE INDEX "GeneratedDocument_orderItemId_idx" ON "GeneratedDocument"("orderItemId");
CREATE INDEX "GeneratedDocument_reviewStatus_idx" ON "GeneratedDocument"("reviewStatus");

ALTER TABLE "Order" ADD CONSTRAINT "Order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GeneratedDocumentFile" ADD CONSTRAINT "GeneratedDocumentFile_generatedDocumentId_fkey" FOREIGN KEY ("generatedDocumentId") REFERENCES "GeneratedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_generatedDocumentId_fkey" FOREIGN KEY ("generatedDocumentId") REFERENCES "GeneratedDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "GeneratedDocumentFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentDownload" ADD CONSTRAINT "DocumentDownload_downloadedById_fkey" FOREIGN KEY ("downloadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentGenerationJob" ADD CONSTRAINT "DocumentGenerationJob_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentGenerationJob" ADD CONSTRAINT "DocumentGenerationJob_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentGenerationJob" ADD CONSTRAINT "DocumentGenerationJob_documentInputId_fkey" FOREIGN KEY ("documentInputId") REFERENCES "DocumentInput"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentInput" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GeneratedDocumentFile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentDownload" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "Product" FROM anon, authenticated;
REVOKE ALL ON TABLE "Order" FROM anon, authenticated;
REVOKE ALL ON TABLE "OrderItem" FROM anon, authenticated;
REVOKE ALL ON TABLE "Payment" FROM anon, authenticated;
REVOKE ALL ON TABLE "PaymentEvent" FROM anon, authenticated;
REVOKE ALL ON TABLE "Invoice" FROM anon, authenticated;
REVOKE ALL ON TABLE "DocumentInput" FROM anon, authenticated;
REVOKE ALL ON TABLE "GeneratedDocumentFile" FROM anon, authenticated;
REVOKE ALL ON TABLE "DocumentDownload" FROM anon, authenticated;
