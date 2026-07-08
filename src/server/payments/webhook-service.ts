import "server-only";

import { getPaymentProvider } from "@/server/payments";

export async function handlePaymentWebhook(request: Request) {
  const provider = getPaymentProvider();
  const event = await provider.verifyWebhook(request);
  return provider.handleWebhookEvent(event);
}
