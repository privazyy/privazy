import "server-only";

import { z } from "zod";

import { calculateLine } from "@/lib/shop/money";
import { CommerceError } from "@/server/commerce/errors";
import { getPrisma } from "@/server/db/prisma";

export const pricingRequestSchema = z.object({
  currency: z.literal("PLN").default("PLN"),
  productSlug: z.string().trim().min(1).max(120),
  quantity: z.number().int().min(1).max(10).default(1),
});

export async function priceProduct(input: z.input<typeof pricingRequestSchema>) {
  const parsed = pricingRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw new CommerceError("invalid_input", "Nieprawidłowe dane produktu.", 400);
  }

  const product = await getPrisma().product.findUnique({
    where: { slug: parsed.data.productSlug },
  });

  if (!product) {
    throw new CommerceError("not_found", "Produkt nie istnieje.", 404);
  }
  if (product.status !== "ACTIVE") {
    throw new CommerceError("conflict", "Produkt nie jest dostępny w sprzedaży.", 409);
  }
  if (product.currency !== parsed.data.currency || product.currency !== "PLN") {
    throw new CommerceError("conflict", "Waluta produktu nie jest obsługiwana.", 409);
  }
  if (product.priceNetCents <= 0 || product.vatRateBps < 0) {
    throw new CommerceError("conflict", "Produkt nie ma poprawnej ceny sprzedażowej.", 409);
  }

  return {
    line: calculateLine({
      currency: product.currency,
      quantity: parsed.data.quantity,
      unitNetCents: product.priceNetCents,
      vatRateBps: product.vatRateBps,
    }),
    product,
    quantity: parsed.data.quantity,
    unitPriceNetCents: product.priceNetCents,
    vatRateBps: product.vatRateBps,
  };
}
