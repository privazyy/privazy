-- Commerce invoice mock/sandbox foundation.

CREATE TYPE "InvoiceStatus" AS ENUM (
    'DRAFT',
    'REQUESTED',
    'ISSUED',
    'FAILED',
    'CANCELLED',
    'CORRECTED'
);

CREATE TYPE "InvoiceProvider" AS ENUM ('MOCK', 'SANDBOX', 'LIVE');

CREATE TYPE "InvoiceMode" AS ENUM ('MOCK', 'SANDBOX', 'LIVE');

-- Dedicated mock sequence. It is not a production accounting sequence.
CREATE SEQUENCE "MockInvoiceNumber_seq"
    AS BIGINT
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "invoiceNumber" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'REQUESTED',
    "provider" "InvoiceProvider" NOT NULL DEFAULT 'MOCK',
    "mode" "InvoiceMode" NOT NULL DEFAULT 'MOCK',
    "currency" TEXT NOT NULL DEFAULT 'PLN',
    "totalNetCents" INTEGER NOT NULL,
    "totalVatCents" INTEGER NOT NULL,
    "discountCents" INTEGER NOT NULL DEFAULT 0,
    "totalGrossCents" INTEGER NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerCompany" TEXT,
    "buyerTaxId" TEXT,
    "buyerAddress" JSONB NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "externalId" TEXT,
    "externalUrl" TEXT,
    "pdfFileId" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Invoice_totalNetCents_nonnegative" CHECK ("totalNetCents" >= 0),
    CONSTRAINT "Invoice_totalVatCents_nonnegative" CHECK ("totalVatCents" >= 0),
    CONSTRAINT "Invoice_discountCents_nonnegative" CHECK ("discountCents" >= 0),
    CONSTRAINT "Invoice_totalGrossCents_nonnegative" CHECK ("totalGrossCents" >= 0),
    CONSTRAINT "Invoice_totals_consistent" CHECK (
        "totalGrossCents" = "totalNetCents" + "totalVatCents" - "discountCents"
        AND "discountCents" <= "totalNetCents" + "totalVatCents"
    )
);

CREATE TABLE "InvoiceEvent" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "externalId" TEXT,
    "payloadHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE UNIQUE INDEX "Invoice_externalId_key" ON "Invoice"("externalId");
CREATE INDEX "Invoice_organizationId_idx" ON "Invoice"("organizationId");
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX "Invoice_createdAt_idx" ON "Invoice"("createdAt");

CREATE UNIQUE INDEX "InvoiceEvent_externalId_key" ON "InvoiceEvent"("externalId");
CREATE INDEX "InvoiceEvent_invoiceId_idx" ON "InvoiceEvent"("invoiceId");
CREATE INDEX "InvoiceEvent_createdAt_idx" ON "InvoiceEvent"("createdAt");

ALTER TABLE "Invoice"
    ADD CONSTRAINT "Invoice_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Invoice"
    ADD CONSTRAINT "Invoice_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Invoice"
    ADD CONSTRAINT "Invoice_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InvoiceEvent"
    ADD CONSTRAINT "InvoiceEvent_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Server-only tables: defense in depth against automatic Data API exposure.
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceEvent" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "Invoice", "InvoiceEvent" FROM PUBLIC;
REVOKE ALL ON SEQUENCE "MockInvoiceNumber_seq" FROM PUBLIC;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON TABLE "Invoice", "InvoiceEvent" FROM anon;
        REVOKE ALL ON SEQUENCE "MockInvoiceNumber_seq" FROM anon;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        REVOKE ALL ON TABLE "Invoice", "InvoiceEvent" FROM authenticated;
        REVOKE ALL ON SEQUENCE "MockInvoiceNumber_seq" FROM authenticated;
    END IF;
END
$$;
