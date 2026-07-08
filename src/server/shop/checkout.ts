import "server-only";

import { randomBytes } from "node:crypto";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { calculateLine, sumBreakdowns } from "@/lib/shop/money";
import type { PublicOrderView } from "@/lib/shop/types";
import { CommerceError } from "@/server/commerce/errors";
import { assertCheckoutEnabled, assertNoLivePayments } from "@/server/commerce/flags";
import { getPrisma } from "@/server/db/prisma";
import { createPaymentForOrder } from "@/server/payments/payment-service";
import { hashCartToken } from "@/server/shop/cart";
import { calculateCouponDiscount } from "@/server/shop/coupons";

export const checkoutPayloadSchema = z
  .object({
    addressLine1: z.string().trim().min(3, "Podaj adres."),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(2, "Podaj miejscowosc."),
    companyName: z.string().trim().optional(),
    country: z.string().trim().default("PL"),
    customerType: z.enum(["PERSON", "COMPANY"]),
    email: z.string().trim().email("Podaj poprawny adres e-mail."),
    name: z.string().trim().min(2, "Podaj imie i nazwisko."),
    nip: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    postalCode: z.string().trim().min(4, "Podaj kod pocztowy."),
    wantsInvoice: z.boolean().default(true),
    consents: z.object({
      contact: z.boolean().optional(),
      privacy: z.boolean(),
      terms: z.boolean(),
    }),
  })
  .superRefine((value, ctx) => {
    if (!value.consents.terms) {
      ctx.addIssue({ code: "custom", message: "Zaakceptuj regulamin.", path: ["consents", "terms"] });
    }
    if (!value.consents.privacy) {
      ctx.addIssue({ code: "custom", message: "Zaakceptuj polityke prywatnosci.", path: ["consents", "privacy"] });
    }
    if (value.customerType === "COMPANY" && !value.companyName) {
      ctx.addIssue({ code: "custom", message: "Podaj nazwe firmy.", path: ["companyName"] });
    }
    if (value.customerType === "COMPANY" && !value.nip) {
      ctx.addIssue({ code: "custom", message: "Podaj NIP do faktury.", path: ["nip"] });
    }
  });

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;

export async function createCheckoutOrder(input: {
  cartToken?: string | null;
  payload: CheckoutPayload;
}) {
  assertCheckoutEnabled();
  assertNoLivePayments();
  if (!input.cartToken) {
    throw new CommerceError("not_found", "Brak aktywnego koszyka.", 404);
  }

  const prisma = getPrisma();
  const checkout = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      include: {
        coupon: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      where: { anonymousId: hashCartToken(input.cartToken ?? "") },
    });

    if (!cart || cart.status !== "ACTIVE") {
      throw new CommerceError("not_found", "Koszyk jest niedostępny.", 404);
    }
    if (cart.items.length === 0) {
      throw new CommerceError("conflict", "Koszyk jest pusty.", 409);
    }

    const lineItems = cart.items.map((item) => {
      if (item.product.status !== "ACTIVE") {
        throw new CommerceError("conflict", `Produkt ${item.product.name} nie jest już dostępny.`, 409);
      }
      if (item.variant && item.variant.status !== "ACTIVE") {
        throw new CommerceError("conflict", `Wariant produktu ${item.product.name} nie jest już dostępny.`, 409);
      }

      const unitNetCents = item.variant?.priceNetCents ?? item.product.priceNetCents;
      const vatRateBps = item.variant?.vatRateBps ?? item.product.vatRateBps;
      const currency = item.variant?.currency ?? item.product.currency;
      if (unitNetCents <= 0) {
        throw new CommerceError("conflict", `Produkt ${item.product.name} nie ma aktywnej ceny sprzedażowej.`, 409);
      }
      const line = calculateLine({ currency, quantity: item.quantity, unitNetCents, vatRateBps });

      return {
        cartItemId: item.id,
        currency,
        line,
        product: item.product,
        productSnapshot: buildOrderProductSnapshot(item),
        quantity: item.quantity,
        unitNetCents,
        variantId: item.variantId,
        vatRateBps,
      };
    });

    const totals = sumBreakdowns(
      lineItems.map((item) => item.line),
      calculateCouponDiscount(cart.coupon, lineItems.map((item) => item.line)),
    );
    if (totals.totalGrossCents <= 0) {
      throw new CommerceError("conflict", "Checkout zerowy nie jest włączony.", 409);
    }

    const organization =
      input.payload.customerType === "COMPANY"
        ? await tx.organization.create({
            data: {
              addressLine1: input.payload.addressLine1,
              addressLine2: input.payload.addressLine2 || null,
              city: input.payload.city,
              country: input.payload.country || "PL",
              email: input.payload.email,
              name: input.payload.companyName ?? input.payload.name,
              nip: input.payload.nip ?? null,
              phone: input.payload.phone || null,
              postalCode: input.payload.postalCode,
            },
          })
        : null;

    const billingProfile = await tx.billingProfile.create({
      data: {
        addressLine1: input.payload.addressLine1,
        addressLine2: input.payload.addressLine2 || null,
        city: input.payload.city,
        companyName: input.payload.customerType === "COMPANY" ? input.payload.companyName ?? null : null,
        country: input.payload.country || "PL",
        customerType: input.payload.customerType,
        email: input.payload.email,
        name: input.payload.name,
        nip: input.payload.customerType === "COMPANY" ? input.payload.nip ?? null : null,
        organizationId: organization?.id,
        phone: input.payload.phone || null,
        postalCode: input.payload.postalCode,
        wantsInvoice: input.payload.wantsInvoice,
      },
    });

    const publicAccessToken = createPublicAccessToken();
    const order = await tx.order.create({
      data: {
        billingProfileId: billingProfile.id,
        cartId: cart.id,
        couponId: cart.couponId,
        currency: totals.currency,
        discountCents: totals.discountCents,
        email: input.payload.email,
        orderNumber: await createOrderNumber(tx),
        organizationId: organization?.id,
        phone: input.payload.phone || null,
        publicAccessToken,
        paymentStatus: "CREATED",
        source: {
          channel: "web_checkout",
          environment: "sandbox",
          consents: {
            contact: Boolean(input.payload.consents.contact),
            privacy: input.payload.consents.privacy,
            terms: input.payload.consents.terms,
          },
        },
        status: "PENDING_PAYMENT",
        subtotalNetCents: totals.subtotalNetCents,
        totalGrossCents: totals.totalGrossCents,
        vatCents: totals.vatCents,
        wantsInvoice: input.payload.wantsInvoice,
      },
    });

    for (const item of lineItems) {
      await tx.orderItem.create({
        data: {
          currency: item.currency,
          orderId: order.id,
          productId: item.product.id,
          productName: item.product.name,
          productSlug: item.product.slug,
          productSnapshot: item.productSnapshot,
          productType: item.product.productType,
          quantity: item.quantity,
          documentTemplateId: item.product.documentTemplateId,
          status: "NOT_STARTED",
          subtotalNetCents: item.line.subtotalNetCents,
          totalGrossCents: item.line.totalGrossCents,
          unitNetCents: item.unitNetCents,
          variantId: item.variantId,
          vatCents: item.line.vatCents,
          vatRateBps: item.vatRateBps,
        },
      });

    }

    await tx.cart.update({
      data: {
        checkedOutAt: new Date(),
        discountCents: totals.discountCents,
        organizationId: organization?.id,
        status: "CONVERTED",
        subtotalNetCents: totals.subtotalNetCents,
        totalGrossCents: totals.totalGrossCents,
        vatCents: totals.vatCents,
      },
      where: { id: cart.id },
    });
    if (cart.couponId && totals.discountCents > 0) {
      await tx.coupon.update({
        data: { redeemedCount: { increment: 1 } },
        where: { id: cart.couponId },
      });
    }

    await tx.auditLog.create({
      data: {
        action: "order.created",
        entityId: order.id,
        entityType: "Order",
        metadata: {
          itemCount: cart.items.length,
          orderNumber: order.orderNumber,
          totalGrossCents: totals.totalGrossCents,
        },
        organizationId: organization?.id,
      },
    });

    return order;
  });

  const payment = await createPaymentForOrder({
    amountGrossCents: checkout.totalGrossCents,
    currency: checkout.currency,
    orderId: checkout.id,
    orderNumber: checkout.orderNumber,
    publicAccessToken: checkout.publicAccessToken,
  });

  return {
    orderNumber: checkout.orderNumber,
    paymentUrl: payment.paymentUrl,
    publicAccessToken: checkout.publicAccessToken,
  };
}

export async function getPublicOrderView(orderNumber: string, token: string): Promise<PublicOrderView | null> {
  if (!orderNumber || !token) return null;

  const order = await getPrisma().order.findFirst({
    include: {
      billingProfile: true,
      invoice: true,
      items: {
        orderBy: { createdAt: "asc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
    where: {
      orderNumber,
      publicAccessToken: token,
    },
  });

  if (!order) return null;

  return {
    billing: {
      city: order.billingProfile.city,
      companyName: order.billingProfile.companyName,
      customerType: order.billingProfile.customerType,
      email: order.billingProfile.email,
      name: order.billingProfile.name,
      nip: order.billingProfile.nip,
      postalCode: order.billingProfile.postalCode,
    },
    currency: order.currency,
    discountCents: order.discountCents,
    invoice: order.invoice
      ? {
          invoiceNumber: order.invoice.invoiceNumber,
          mode: order.invoice.mode,
          pdfAvailable: Boolean(order.invoice.pdfFileId),
          provider: order.invoice.provider,
          status: order.invoice.status,
        }
      : null,
    items: order.items.map((item) => ({
      inputFormPath: item.inputFormPath,
      productName: item.productName,
      productSlug: item.productSlug,
      quantity: item.quantity,
      status: item.status,
      totalGrossCents: item.totalGrossCents,
    })),
    orderNumber: order.orderNumber,
    payments: order.payments.map((payment) => ({
      amountGrossCents: payment.amountGrossCents,
      paymentUrl:
        payment.status === "PENDING"
          ? `/checkout/mock?paymentId=${encodeURIComponent(payment.id)}&token=${encodeURIComponent(token)}`
          : null,
      status: payment.status,
    })),
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotalNetCents: order.subtotalNetCents,
    totalGrossCents: order.totalGrossCents,
    vatCents: order.vatCents,
    wantsInvoice: order.wantsInvoice,
  };
}

function buildOrderProductSnapshot(
  item: Prisma.CartItemGetPayload<{ include: { product: true; variant: true } }>,
) {
  return {
    currency: item.variant?.currency ?? item.product.currency,
    expectedDelivery: item.variant?.expectedDelivery ?? item.product.expectedDelivery,
    includedFiles: item.variant?.includedFiles ?? item.product.includedFiles,
    legalDisclaimer: item.product.legalDisclaimer,
    name: item.variant ? `${item.product.name} - ${item.variant.name}` : item.product.name,
    priceNetCents: item.variant?.priceNetCents ?? item.product.priceNetCents,
    productType: item.product.productType,
    shortDescription: item.product.shortDescription,
    slug: item.product.slug,
    vatRateBps: item.variant?.vatRateBps ?? item.product.vatRateBps,
  };
}

async function createOrderNumber(tx: Prisma.TransactionClient) {
  const date = new Date();
  const prefix = `PVZ-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = randomBytes(3).toString("hex").toUpperCase();
    const orderNumber = `${prefix}-${suffix}`;
    const existing = await tx.order.findUnique({ where: { orderNumber } });
    if (!existing) return orderNumber;
  }

  throw new Error("Nie udalo sie wygenerowac numeru zamowienia.");
}

function createPublicAccessToken() {
  return randomBytes(32).toString("base64url");
}
