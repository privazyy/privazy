import "server-only";

import { randomBytes } from "node:crypto";

import { Prisma } from "@prisma/client";

import { calculateLine, sumBreakdowns } from "@/lib/shop/money";
import type { CartView } from "@/lib/shop/types";
import { getPrisma } from "@/server/db/prisma";

export const CART_COOKIE_NAME = process.env.SHOP_CART_COOKIE_NAME ?? "privazy_cart_id";

export type CartViewResult = Awaited<ReturnType<typeof getCartViewByToken>>;

export function createCartToken() {
  return randomBytes(32).toString("base64url");
}

export async function getCartViewByToken(sessionToken?: string | null): Promise<CartView> {
  if (!sessionToken) return emptyCartView();
  if (!hasDatabaseUrl()) return emptyCartView(sessionToken);

  const cart = await getPrisma().cart.findUnique({
    include: {
      coupon: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    where: { sessionToken },
  });

  if (!cart || cart.status !== "ACTIVE") return emptyCartView(sessionToken);
  return mapCartToView(cart);
}

export async function addCartItem(input: { productSlug: string; quantity?: number; sessionToken?: string | null }) {
  const prisma = getPrisma();
  const quantity = Math.max(1, Math.min(10, input.quantity ?? 1));
  const sessionToken = input.sessionToken || createCartToken();

  const result = await prisma.$transaction(async (tx) => {
    const cart = await getOrCreateCart(tx, sessionToken);
    const product = await tx.product.findUnique({
      where: { slug: input.productSlug },
    });

    if (!product || product.status !== "ACTIVE") {
      throw new Error("Produkt jest niedostępny albo archiwalny.");
    }

    const existing = await tx.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variantId: null,
      },
    });

    const snapshot = buildProductSnapshot(product);
    const line = calculateLine({
      currency: product.currency,
      quantity,
      unitNetCents: product.priceNetCents,
      vatRateBps: product.vatRateBps,
    });

    if (existing) {
      await tx.cartItem.update({
        data: {
          currency: product.currency,
          productSnapshot: snapshot,
          quantity: Math.min(10, existing.quantity + quantity),
          unitNetCents: product.priceNetCents,
          vatRateBps: product.vatRateBps,
        },
        where: { id: existing.id },
      });
    } else {
      await tx.cartItem.create({
        data: {
          cartId: cart.id,
          currency: line.currency,
          productId: product.id,
          productSnapshot: snapshot,
          quantity,
          unitNetCents: product.priceNetCents,
          vatRateBps: product.vatRateBps,
        },
      });
    }

    await recalculateCart(tx, cart.id);
    return cart.sessionToken;
  });

  return {
    cart: await getCartViewByToken(result),
    sessionToken: result,
  };
}

export async function updateCartItem(input: { itemId: string; quantity: number; sessionToken?: string | null }) {
  if (!input.sessionToken) throw new Error("Brak koszyka.");

  const quantity = Math.max(0, Math.min(10, input.quantity));
  const prisma = getPrisma();

  await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({ where: { sessionToken: input.sessionToken ?? "" } });
    if (!cart || cart.status !== "ACTIVE") throw new Error("Koszyk jest niedostępny.");

    const item = await tx.cartItem.findFirst({
      where: { cartId: cart.id, id: input.itemId },
    });
    if (!item) throw new Error("Pozycja koszyka nie istnieje.");

    if (quantity === 0) {
      await tx.cartItem.delete({ where: { id: item.id } });
    } else {
      await tx.cartItem.update({
        data: { quantity },
        where: { id: item.id },
      });
    }

    await recalculateCart(tx, cart.id);
  });

  return getCartViewByToken(input.sessionToken);
}

export async function removeCartItem(input: { itemId: string; sessionToken?: string | null }) {
  return updateCartItem({ ...input, quantity: 0 });
}

async function getOrCreateCart(tx: Prisma.TransactionClient, sessionToken: string) {
  const existing = await tx.cart.findUnique({ where: { sessionToken } });
  if (existing && existing.status === "ACTIVE") return existing;

  return tx.cart.create({
    data: {
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      sessionToken,
    },
  });
}

async function recalculateCart(tx: Prisma.TransactionClient, cartId: string) {
  const cart = await tx.cart.findUnique({
    include: {
      coupon: true,
      items: true,
    },
    where: { id: cartId },
  });
  if (!cart) throw new Error("Koszyk nie istnieje.");

  const lines = cart.items.map((item) =>
    calculateLine({
      currency: item.currency,
      quantity: item.quantity,
      unitNetCents: item.unitNetCents,
      vatRateBps: item.vatRateBps,
    }),
  );
  const totals = sumBreakdowns(lines, calculateCouponDiscount(cart.coupon, lines));

  await tx.cart.update({
    data: totals,
    where: { id: cartId },
  });
}

function calculateCouponDiscount(
  coupon: { amountOffCents: number | null; percentOffBps: number | null; status: string } | null,
  lines: Array<{ totalGrossCents: number }>,
) {
  if (!coupon || coupon.status !== "ACTIVE") return 0;

  const gross = lines.reduce((sum, line) => sum + line.totalGrossCents, 0);
  if (coupon.amountOffCents) return coupon.amountOffCents;
  if (coupon.percentOffBps) return Math.round((gross * coupon.percentOffBps) / 10_000);
  return 0;
}

function buildProductSnapshot(product: {
  currency: string;
  expectedDelivery: string;
  includedFiles: Prisma.JsonValue;
  legalDisclaimer: string;
  name: string;
  priceNetCents: number;
  productType: string;
  shortDescription: string;
  slug: string;
  vatRateBps: number;
}) {
  return {
    currency: product.currency,
    expectedDelivery: product.expectedDelivery,
    includedFiles: product.includedFiles,
    legalDisclaimer: product.legalDisclaimer,
    name: product.name,
    priceNetCents: product.priceNetCents,
    productType: product.productType,
    shortDescription: product.shortDescription,
    slug: product.slug,
    vatRateBps: product.vatRateBps,
  };
}

function mapCartToView(cart: Prisma.CartGetPayload<{ include: { coupon: true; items: { include: { product: true; variant: true } } } }>) {
  return {
    coupon: cart.coupon ? { code: cart.coupon.code, id: cart.coupon.id } : null,
    currency: cart.currency,
    discountCents: cart.discountCents,
    id: cart.id,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    items: cart.items.map((item) => {
      const line = calculateLine({
        currency: item.currency,
        quantity: item.quantity,
        unitNetCents: item.unitNetCents,
        vatRateBps: item.vatRateBps,
      });

      return {
        currency: item.currency,
        expectedDelivery: item.product.expectedDelivery,
        id: item.id,
        line,
        name: item.product.name,
        productSlug: item.product.slug,
        productType: item.product.productType,
        quantity: item.quantity,
        shortDescription: item.product.shortDescription,
        status: item.product.status,
        unitNetCents: item.unitNetCents,
        vatRateBps: item.vatRateBps,
      };
    }),
    sessionToken: cart.sessionToken,
    status: cart.status,
    subtotalNetCents: cart.subtotalNetCents,
    totalGrossCents: cart.totalGrossCents,
    vatCents: cart.vatCents,
  };
}

function emptyCartView(sessionToken?: string | null) {
  return {
    coupon: null,
    currency: "PLN",
    discountCents: 0,
    id: null,
    itemCount: 0,
    items: [],
    sessionToken: sessionToken ?? null,
    status: "ACTIVE",
    subtotalNetCents: 0,
    totalGrossCents: 0,
    vatCents: 0,
  } satisfies CartView;
}

function hasDatabaseUrl() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== "replace_in_private_env") return true;
  if (process.env.NODE_ENV === "production") throw new Error("Missing DATABASE_URL for cart reads.");
  return false;
}
