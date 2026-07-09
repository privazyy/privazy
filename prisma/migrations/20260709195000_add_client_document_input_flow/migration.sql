-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductKind" AS ENUM ('DOCUMENT', 'SERVICE', 'PACKAGE');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderItemFulfillmentStatus" AS ENUM ('NOT_STARTED', 'READY_FOR_INPUT', 'INPUT_IN_PROGRESS', 'INPUT_SUBMITTED', 'GENERATION_PENDING', 'GENERATED', 'DELIVERED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "DocumentInputStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'LOCKED', 'GENERATION_PENDING', 'GENERATED', 'NEEDS_CORRECTION', 'CANCELLED');

-- AlterTable
ALTER TABLE "DocumentGenerationJob" ADD COLUMN "documentInputId" TEXT;

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "kind" "ProductKind" NOT NULL DEFAULT 'DOCUMENT',
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "templateId" TEXT,
    "documentType" "DocumentType",
    "priceNetCents" INTEGER NOT NULL DEFAULT 0,
    "vatRateBps" INTEGER NOT NULL DEFAULT 2300,
    "currency" TEXT NOT NULL DEFAULT 'PLN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "paymentStatus" "OrderPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "currency" TEXT NOT NULL DEFAULT 'PLN',
    "totalNetCents" INTEGER NOT NULL DEFAULT 0,
    "totalVatCents" INTEGER NOT NULL DEFAULT 0,
    "totalGrossCents" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "paidAt" TIMESTAMP(3),
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
    "templateId" TEXT,
    "documentType" "DocumentType",
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitNetCents" INTEGER NOT NULL DEFAULT 0,
    "vatRateBps" INTEGER NOT NULL DEFAULT 2300,
    "totalGrossCents" INTEGER NOT NULL DEFAULT 0,
    "fulfillmentStatus" "OrderItemFulfillmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentInput" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orderId" TEXT,
    "orderItemId" TEXT NOT NULL,
    "productId" TEXT,
    "templateId" TEXT NOT NULL,
    "templateVersion" INTEGER,
    "documentType" "DocumentType" NOT NULL,
    "status" "DocumentInputStatus" NOT NULL DEFAULT 'DRAFT',
    "dataJson" JSONB NOT NULL,
    "validationSummary" JSONB,
    "clientRevision" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "submittedById" TEXT,
    "submittedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentInput_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_kind_status_idx" ON "Product"("kind", "status");

-- CreateIndex
CREATE INDEX "Product_templateId_idx" ON "Product"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_organizationId_idx" ON "Order"("organizationId");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_createdAt_idx" ON "Order"("paymentStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Order_createdById_idx" ON "Order"("createdById");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_organizationId_idx" ON "OrderItem"("organizationId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderItem_templateId_idx" ON "OrderItem"("templateId");

-- CreateIndex
CREATE INDEX "OrderItem_fulfillmentStatus_idx" ON "OrderItem"("fulfillmentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentInput_orderItemId_key" ON "DocumentInput"("orderItemId");

-- CreateIndex
CREATE INDEX "DocumentInput_organizationId_idx" ON "DocumentInput"("organizationId");

-- CreateIndex
CREATE INDEX "DocumentInput_orderId_idx" ON "DocumentInput"("orderId");

-- CreateIndex
CREATE INDEX "DocumentInput_productId_idx" ON "DocumentInput"("productId");

-- CreateIndex
CREATE INDEX "DocumentInput_templateId_idx" ON "DocumentInput"("templateId");

-- CreateIndex
CREATE INDEX "DocumentInput_status_updatedAt_idx" ON "DocumentInput"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "DocumentInput_createdById_idx" ON "DocumentInput"("createdById");

-- CreateIndex
CREATE INDEX "DocumentGenerationJob_documentInputId_idx" ON "DocumentGenerationJob"("documentInputId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentGenerationJob" ADD CONSTRAINT "DocumentGenerationJob_documentInputId_fkey" FOREIGN KEY ("documentInputId") REFERENCES "DocumentInput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable RLS for new private operational tables.
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentInput" ENABLE ROW LEVEL SECURITY;

-- Keep Supabase Data API access closed until explicit policies/grants are reviewed.
REVOKE ALL ON TABLE "Product" FROM anon, authenticated;
REVOKE ALL ON TABLE "Order" FROM anon, authenticated;
REVOKE ALL ON TABLE "OrderItem" FROM anon, authenticated;
REVOKE ALL ON TABLE "DocumentInput" FROM anon, authenticated;
