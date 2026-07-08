import "server-only";

import { CommerceError } from "@/server/commerce/errors";

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export function getInvoiceFlags() {
  return {
    invoicesEnabled: enabled(process.env.ENABLE_INVOICES),
    liveInvoicesEnabled: enabled(process.env.ENABLE_LIVE_INVOICES),
    mode: (process.env.INVOICE_MODE ?? "mock").trim().toLowerCase(),
    provider: (process.env.INVOICE_PROVIDER ?? "mock").trim().toLowerCase(),
  };
}

export function assertMockInvoiceIssuingEnabled() {
  const flags = getInvoiceFlags();

  if (!flags.invoicesEnabled) {
    throw new CommerceError(
      "invoice_disabled",
      "Wystawianie faktur testowych jest obecnie wyłączone.",
      503,
    );
  }
  if (flags.liveInvoicesEnabled) {
    throw new CommerceError(
      "conflict",
      "Live invoices nie mają zatwierdzonego providera i pozostają zablokowane.",
      409,
    );
  }
  if (flags.provider !== "mock" || flags.mode !== "mock") {
    throw new CommerceError(
      "conflict",
      "Dostępny jest wyłącznie provider i tryb MOCK.",
      409,
    );
  }
}
