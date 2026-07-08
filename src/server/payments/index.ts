import "server-only";

import { assertNoLivePayments } from "@/server/commerce/flags";
import { MockPaymentProvider } from "@/server/payments/mock-provider";

export function getPaymentProvider() {
  assertNoLivePayments();
  return new MockPaymentProvider();
}
