import "server-only";

import { MockPaymentProvider } from "@/server/payments/mock-provider";

export function getPaymentProvider() {
  const provider = (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase();

  if (provider !== "mock" && process.env.NODE_ENV === "production") {
    throw new Error(`Payment provider ${provider} is not implemented yet.`);
  }

  return new MockPaymentProvider();
}
