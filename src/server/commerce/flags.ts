import "server-only";

import { CommerceError } from "@/server/commerce/errors";

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export function getCommerceFlags() {
  return {
    checkoutEnabled:
      process.env.ENABLE_CHECKOUT === undefined
        ? process.env.NODE_ENV !== "production"
        : enabled(process.env.ENABLE_CHECKOUT),
    livePaymentsEnabled: enabled(process.env.ENABLE_LIVE_PAYMENTS),
    paymentMode: "MOCK" as const,
  };
}

export function assertCheckoutEnabled() {
  if (!getCommerceFlags().checkoutEnabled) {
    throw new CommerceError(
      "checkout_disabled",
      "Checkout sandbox jest obecnie wyłączony.",
      503,
    );
  }
}

export function assertNoLivePayments() {
  if (getCommerceFlags().livePaymentsEnabled) {
    throw new CommerceError(
      "conflict",
      "Live payments nie mają zaimplementowanego providera i pozostają zablokowane.",
      409,
    );
  }
}
