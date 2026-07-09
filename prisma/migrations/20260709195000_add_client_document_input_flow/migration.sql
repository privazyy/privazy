-- Extend the commerce foundation with the client document-input workflow.
-- This migration intentionally builds on 20260709182000 and never recreates
-- Product, Order, OrderItem, or DocumentInput.

ALTER TYPE "FulfillmentStatus" ADD VALUE IF NOT EXISTS 'NOT_STARTED';
ALTER TYPE "FulfillmentStatus" ADD VALUE IF NOT EXISTS 'READY_FOR_INPUT';
ALTER TYPE "FulfillmentStatus" ADD VALUE IF NOT EXISTS 'INPUT_IN_PROGRESS';
ALTER TYPE "FulfillmentStatus" ADD VALUE IF NOT EXISTS 'INPUT_SUBMITTED';
ALTER TYPE "FulfillmentStatus" ADD VALUE IF NOT EXISTS 'GENERATION_PENDING';
ALTER TYPE "FulfillmentStatus" ADD VALUE IF NOT EXISTS 'GENERATED';
ALTER TYPE "FulfillmentStatus" ADD VALUE IF NOT EXISTS 'FAILED';

ALTER TYPE "DocumentInputStatus" ADD VALUE IF NOT EXISTS 'LOCKED';
ALTER TYPE "DocumentInputStatus" ADD VALUE IF NOT EXISTS 'GENERATION_PENDING';
ALTER TYPE "DocumentInputStatus" ADD VALUE IF NOT EXISTS 'GENERATED';
ALTER TYPE "DocumentInputStatus" ADD VALUE IF NOT EXISTS 'NEEDS_CORRECTION';
ALTER TYPE "DocumentInputStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

ALTER TABLE "Product"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "templateId" TEXT;

UPDATE "Product"
SET "slug" = lower(regexp_replace("sku", '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr("id", 1, 8)
WHERE "slug" IS NULL;

ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_templateId_idx" ON "Product"("templateId");
ALTER TABLE "Product" ADD CONSTRAINT "Product_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order" ADD COLUMN "paidAt" TIMESTAMP(3);

ALTER TABLE "OrderItem"
  ADD COLUMN "organizationId" TEXT,
  ADD COLUMN "templateId" TEXT;

UPDATE "OrderItem" item
SET "organizationId" = parent."organizationId"
FROM "Order" parent
WHERE item."orderId" = parent."id" AND item."organizationId" IS NULL;

ALTER TABLE "OrderItem" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "fulfillmentStatus" SET DEFAULT 'NOT_STARTED';
CREATE INDEX "OrderItem_organizationId_idx" ON "OrderItem"("organizationId");
CREATE INDEX "OrderItem_templateId_idx" ON "OrderItem"("templateId");
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentInput" RENAME COLUMN "data" TO "dataJson";
ALTER TABLE "DocumentInput"
  ADD COLUMN "productId" TEXT,
  ADD COLUMN "templateId" TEXT,
  ADD COLUMN "templateVersion" INTEGER,
  ADD COLUMN "documentType" "DocumentType",
  ADD COLUMN "validationSummary" JSONB,
  ADD COLUMN "clientRevision" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "updatedById" TEXT,
  ADD COLUMN "lockedAt" TIMESTAMP(3);

UPDATE "DocumentInput" input
SET
  "productId" = item."productId",
  "templateId" = COALESCE(item."templateId", product."templateId"),
  "documentType" = COALESCE(item."documentType", product."documentType"),
  "createdById" = COALESCE(input."submittedById", organization."ownerId")
FROM "OrderItem" item
LEFT JOIN "Product" product ON product."id" = item."productId"
, "Organization" organization
WHERE input."orderItemId" = item."id"
  AND organization."id" = input."organizationId";

UPDATE "DocumentInput" input
SET "templateVersion" = template."version"
FROM "DocumentTemplate" template
WHERE input."templateId" = template."id";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "DocumentInput"
    WHERE "orderItemId" IS NULL
       OR "templateId" IS NULL
       OR "documentType" IS NULL
       OR "createdById" IS NULL
  ) THEN
    RAISE EXCEPTION 'DocumentInput backfill requires orderItem, template, document type, and creator mappings';
  END IF;
END $$;

DROP INDEX IF EXISTS "DocumentInput_orderItemId_idx";
ALTER TABLE "DocumentInput" ALTER COLUMN "orderItemId" SET NOT NULL;
ALTER TABLE "DocumentInput" ALTER COLUMN "templateId" SET NOT NULL;
ALTER TABLE "DocumentInput" ALTER COLUMN "documentType" SET NOT NULL;
ALTER TABLE "DocumentInput" ALTER COLUMN "createdById" SET NOT NULL;

CREATE UNIQUE INDEX "DocumentInput_orderItemId_key" ON "DocumentInput"("orderItemId");
CREATE INDEX "DocumentInput_productId_idx" ON "DocumentInput"("productId");
CREATE INDEX "DocumentInput_templateId_idx" ON "DocumentInput"("templateId");
CREATE INDEX "DocumentInput_status_updatedAt_idx" ON "DocumentInput"("status", "updatedAt");
CREATE INDEX "DocumentInput_createdById_idx" ON "DocumentInput"("createdById");

ALTER TABLE "DocumentInput" DROP CONSTRAINT "DocumentInput_orderItemId_fkey";
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_orderItemId_fkey"
  FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DocumentInput" ADD CONSTRAINT "DocumentInput_updatedById_fkey"
  FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- The commerce migration already enabled RLS and revoked Data API access.
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentInput" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "Product", "Order", "OrderItem", "DocumentInput" FROM anon, authenticated;
