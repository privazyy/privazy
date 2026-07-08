import "server-only";

import { getPrisma } from "@/server/db/prisma";

export async function listRecentShopOrders(limit = 50) {
  return getPrisma().order.findMany({
    include: {
      billingProfile: true,
      invoice: true,
      items: {
        orderBy: { createdAt: "asc" },
      },
      organization: true,
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function listRecentShopInvoices(limit = 50) {
  return getPrisma().invoice.findMany({
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      order: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function listRecentShopPayments(limit = 50) {
  return getPrisma().payment.findMany({
    include: {
      order: true,
      events: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function listRecentShopPaymentEvents(limit = 50) {
  return getPrisma().paymentEvent.findMany({
    include: {
      order: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
