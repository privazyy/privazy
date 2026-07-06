import "server-only";

import { MockInvoiceProvider } from "@/server/invoices/mock-provider";

export function getInvoiceProvider() {
  const provider = (process.env.INVOICE_PROVIDER ?? "mock").toLowerCase();

  if (provider !== "mock" && process.env.NODE_ENV === "production") {
    throw new Error(`Invoice provider ${provider} is not implemented yet.`);
  }

  return new MockInvoiceProvider();
}
