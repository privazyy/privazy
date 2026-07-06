import "server-only";

import { getPaymentProvider } from "@/server/payments";

export async function handlePaymentWebhook(request: Request) {
  return getPaymentProvider().handleWebhook(request);
}
