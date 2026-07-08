import "server-only";

import { MockInvoiceProvider } from "@/server/invoices/mock-provider";
import type { InvoiceProviderAdapter } from "@/server/invoices/provider";

let provider: InvoiceProviderAdapter | null = null;

export function getInvoiceProvider() {
  provider ??= new MockInvoiceProvider();
  return provider;
}
