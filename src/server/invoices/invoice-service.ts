import "server-only";

import { getInvoiceProvider } from "@/server/invoices";

export async function issueInvoiceForOrder(orderId: string) {
  return getInvoiceProvider().issueInvoice({ orderId });
}
