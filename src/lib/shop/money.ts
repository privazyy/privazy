export type MoneyBreakdown = {
  subtotalNetCents: number;
  vatCents: number;
  discountCents: number;
  totalGrossCents: number;
  currency: string;
};

export function calculateGrossFromNet(netCents: number, vatRateBps: number) {
  return netCents + calculateVat(netCents, vatRateBps);
}

export function calculateVat(netCents: number, vatRateBps: number) {
  return Math.round((netCents * vatRateBps) / 10_000);
}

export function calculateLine(input: {
  quantity: number;
  unitNetCents: number;
  vatRateBps: number;
  currency?: string;
}) {
  const subtotalNetCents = input.unitNetCents * input.quantity;
  const vatCents = calculateVat(subtotalNetCents, input.vatRateBps);

  return {
    currency: input.currency ?? "PLN",
    subtotalNetCents,
    vatCents,
    totalGrossCents: subtotalNetCents + vatCents,
  };
}

export function sumBreakdowns(items: Array<Pick<MoneyBreakdown, "subtotalNetCents" | "vatCents" | "totalGrossCents">>, discountCents = 0) {
  const subtotalNetCents = items.reduce((sum, item) => sum + item.subtotalNetCents, 0);
  const vatCents = items.reduce((sum, item) => sum + item.vatCents, 0);
  const grossBeforeDiscount = items.reduce((sum, item) => sum + item.totalGrossCents, 0);
  const safeDiscount = Math.min(Math.max(0, discountCents), grossBeforeDiscount);

  return {
    currency: "PLN",
    discountCents: safeDiscount,
    subtotalNetCents,
    vatCents,
    totalGrossCents: grossBeforeDiscount - safeDiscount,
  } satisfies MoneyBreakdown;
}

export function formatMoney(cents: number, currency = "PLN") {
  return new Intl.NumberFormat("pl-PL", {
    currency,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(cents / 100);
}

export function formatNetGross(netCents: number, vatRateBps: number) {
  return {
    gross: formatMoney(calculateGrossFromNet(netCents, vatRateBps)),
    net: formatMoney(netCents),
    vat: `${vatRateBps / 100}% VAT`,
  };
}
