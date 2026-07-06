import "server-only";

import { getPrisma } from "@/server/db/prisma";
import { getPaymentProvider } from "@/server/payments";

export async function createPaymentForPublicOrder(input: { orderNumber: string; token: string }) {
  const order = await getPrisma().order.findFirst({
    where: {
      orderNumber: input.orderNumber,
      publicAccessToken: input.token,
    },
  });

  if (!order) throw new Error("Zamowienie nie istnieje.");
  if (order.status === "PAID") throw new Error("Zamowienie jest juz oplacone.");

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
