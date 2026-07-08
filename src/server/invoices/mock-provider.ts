import "server-only";

import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";

import { CommerceError } from "@/server/commerce/errors";
import { getPrisma } from "@/server/db/prisma";
import { assertMockInvoiceIssuingEnabled } from "@/server/invoices/flags";
import type {
  CreateInvoiceInput,
  InvoiceProviderAdapter,
  InvoiceProviderResult,
} from "@/server/invoices/provider";

export class MockInvoiceProvider implements InvoiceProviderAdapter {
  async createInvoice(input: CreateInvoiceInput): Promise<InvoiceProviderResult> {
    assertMockInvoiceIssuingEnabled();
    const prisma = getPrisma();

    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT "id"
        FROM "Invoice"
        WHERE "id" = ${input.invoiceId}
        FOR UPDATE
      `;

      const invoice = await tx.invoice.findUnique({
        where: { id: input.invoiceId },
      });
      if (!invoice) {
        throw new CommerceError("not_found", "Faktura nie istnieje.", 404);
      }
      if (invoice.provider !== "MOCK" || invoice.mode !== "MOCK") {
        throw new CommerceError(
          "conflict",
          "Faktura nie korzysta z providera MOCK.",
          409,
        );
      }
      if (
        invoice.status === "CANCELLED" ||
        invoice.status === "CORRECTED"
      ) {
        throw new CommerceError(
          "conflict",
          "Faktura nie może zostać ponownie wystawiona.",
          409,
        );
      }
      if (
        invoice.status === "ISSUED" &&
        invoice.invoiceNumber &&
        invoice.externalId &&
        invoice.issuedAt
      ) {
        return toProviderResult(invoice);
      }

      const [sequence] = await tx.$queryRaw<Array<{ value: bigint }>>`
        SELECT nextval('"MockInvoiceNumber_seq"')::bigint AS value
      `;
      if (!sequence) {
        throw new CommerceError(
          "conflict",
          "Nie udało się nadać numeru faktury mock.",
          409,
        );
      }

      const issuedAt = new Date();
      const invoiceNumber = `MOCK/${issuedAt.getUTCFullYear()}/${sequence.value
        .toString()
        .padStart(6, "0")}`;
      const externalId = `mock_invoice_${invoice.id}`;
      const eventExternalId = `mock_invoice_issued_${invoice.id}`;
      const payloadHash = createHash("sha256")
        .update(
          JSON.stringify({
            currency: invoice.currency,
            externalId,
            invoiceId: invoice.id,
            orderId: invoice.orderId,
            totalGrossCents: invoice.totalGrossCents,
          }),
        )
        .digest("hex");

      const updated = await tx.invoice.update({
        data: {
          externalId,
          externalUrl: null,
          failureReason: null,
          invoiceNumber,
          issuedAt,
          mode: "MOCK",
          pdfFileId: null,
          provider: "MOCK",
          status: "ISSUED",
        },
        where: { id: invoice.id },
      });

      await tx.invoiceEvent.upsert({
        create: {
          eventType: "mock.invoice.issued",
          externalId: eventExternalId,
          invoiceId: invoice.id,
          payloadHash,
        },
        update: {},
        where: { externalId: eventExternalId },
      });
      await tx.auditLog.create({
        data: {
          action: "invoice.mock_issued",
          entityId: invoice.id,
          entityType: "Invoice",
          metadata: {
            invoiceNumber,
            orderId: invoice.orderId,
            provider: "MOCK",
          },
          organizationId: invoice.organizationId,
          userId: input.actorUserId,
        },
      });

      return toProviderResult(updated);
    });
  }

  async getInvoiceStatus(invoiceId: string) {
    const invoice = await getPrisma().invoice.findUnique({
      select: { status: true },
      where: { id: invoiceId },
    });

    return invoice?.status ?? "UNKNOWN";
  }
}

function toProviderResult(invoice: {
  externalId: string | null;
  id: string;
  invoiceNumber: string | null;
  issuedAt: Date | null;
  status: string;
}) {
  if (
    !invoice.externalId ||
    !invoice.invoiceNumber ||
    !invoice.issuedAt ||
    invoice.status !== "ISSUED"
  ) {
    throw new CommerceError(
      "conflict",
      "Faktura mock nie ma kompletnego statusu ISSUED.",
      409,
    );
  }

  return {
    externalId: invoice.externalId,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    issuedAt: invoice.issuedAt,
    mode: "MOCK",
    provider: "MOCK",
    status: "ISSUED",
  } satisfies InvoiceProviderResult;
}

export function isInvoiceUniqueConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
