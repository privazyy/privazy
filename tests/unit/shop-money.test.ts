import { describe, expect, it } from "vitest";

import { calculateGrossFromNet, calculateLine, calculateVat, sumBreakdowns } from "@/lib/shop/money";

describe("shop money helpers", () => {
  it("calculates gross and VAT with grosz rounding", () => {
    expect(calculateVat(12_345, 2300)).toBe(2_839);
    expect(calculateGrossFromNet(12_345, 2300)).toBe(15_184);
  });

  it("totals cart lines and clamps discounts", () => {
    const first = calculateLine({ quantity: 2, unitNetCents: 10_000, vatRateBps: 2300 });
    const second = calculateLine({ quantity: 1, unitNetCents: 5_000, vatRateBps: 800 });

    expect(sumBreakdowns([first, second], 1_000)).toMatchObject({
      discountCents: 1_000,
      subtotalNetCents: 25_000,
      totalGrossCents: 29_000,
      vatCents: 5_000,
    });
    expect(sumBreakdowns([first], 999_999).totalGrossCents).toBe(0);
  });
});
