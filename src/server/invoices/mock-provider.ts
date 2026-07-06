import "server-only";

import { getPrisma } from "@/server/db/prisma";
import { invoiceIssuedEmail, sendTransactionalEmail } from "@/server/email/transactional";
import type { InvoiceProviderClient, InvoiceProviderIssueInput } from "@/server/invoices/invoice-provider";

export class MockInvoiceProvider implements InvoiceProviderClient {
  async issueInvoice(input: InvoiceProviderIssueInput) {
    const prisma = getPrisma();
    const order = await prisma.order.findUnique({
      include: {
        billingProfile: true,
        invoices: true,
        items: true,
        organization: true,
      },
      where: { id: input.orderId },
    });

    if (!order) throw new Error("Zamówienie nie istnieje.");
    const existing = order.invoices[0];
    if (existing) {
      return {
        invoiceId: existing.id,
        invoiceNumber: existing.invoiceNumber,
        status: existing.status === "ISSUED" ? "ISSUED" : "DRAFT",
      } as const;
    }

    const invoiceNumber = `FV-MOCK/${new Date().getFullYear()}/${order.orderNumber}`;
    const invoice = await prisma.invoice.create({
      data: {
        buyerSnapshot: {
          addressLine1: order.billingProfile.addressLine1,
          city: order.billingProfile.city,
          companyName: order.billingProfile.companyName,
          country: order.billingProfile.country,
          customerType: order.billingProfile.customerType,
          email: order.billingProfile.email,
          name: order.billingProfile.name,
          nip: order.billingProfile.nip,
          postalCode: order.billingProfile.postalCode,
        },
        currency: order.currency,
        invoiceNumber,
        issuedAt: new Date(),
        itemsSnapshot: order.items.map((item) => ({
          gross: item.totalGrossCents,
          name: item.productName,
          net: item.subtotalNetCents,
          quantity: item.quantity,
          vat: item.vatCents,
        })),
        orderId: order.id,
        organizationId: order.organizationId,
        provider: "MOCK",
        status: "ISSUED",
        subtotalNetCents: order.subtotalNetCents,
        totalGrossCents: order.totalGrossCents,
        vatCents: order.vatCents,
      },
    });

    await sendTransactionalEmail({
      to: order.email,
      ...invoiceIssuedEmail({
        invoiceNumber: invoice.invoiceNumber,
        orderNumber: order.orderNumber,
        statusUrl: buildOrderStatusUrl(order.orderNumber, order.publicAccessToken),
      }),
    }).catch((error) => {
      console.error("Invoice issued email failed", error);
    });

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: "ISSUED",
    } as const;
  }
}

function buildOrderStatusUrl(orderNumber: string, token: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${baseUrl}/zamowienie/${orderNumber}?token=${encodeURIComponent(token)}`;
}
