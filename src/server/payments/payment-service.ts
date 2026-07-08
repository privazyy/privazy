import "server-only";

import { CommerceError } from "@/server/commerce/errors";
import { getPrisma } from "@/server/db/prisma";
import { getPaymentProvider } from "@/server/payments";

export async function createPaymentForPublicOrder(input: { orderNumber: string; token: string }) {
  const order = await getPrisma().order.findFirst({
    where: {
      orderNumber: input.orderNumber,
      publicAccessToken: input.token,
    },
  });

  if (!order) throw new CommerceError("not_found", "Zamówienie nie istnieje.", 404);
  if (order.status === "PAID") {
    throw new CommerceError("conflict", "Zamówienie jest już opłacone.", 409);
  }
  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    throw new CommerceError("conflict", "Zamówienie nie może otrzymać nowej płatności.", 409);
  }

  return getPaymentProvider().createPayment({
    amountGrossCents: order.totalGrossCents,
    currency: order.currency,
    orderId: order.id,
    orderNumber: order.orderNumber,
    publicAccessToken: order.publicAccessToken,
  });
}

export async function createPaymentForOrder(input: {
  amountGrossCents: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  publicAccessToken: string;
}) {
  return getPaymentProvider().createPayment(input);
}
