import "server-only";

import { getPrisma } from "@/server/db/prisma";

export async function listRecentShopOrders(limit = 50) {
  return getPrisma().order.findMany({
    include: {
      billingProfile: true,
      invoices: {
        orderBy: { createdAt: "desc" },
      },
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
      order: true,
      organization: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function listRecentShopPayments(limit = 50) {
  return getPrisma().payment.findMany({
    include: {
      order: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
