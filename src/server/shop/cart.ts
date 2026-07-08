import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { Prisma } from "@prisma/client";

import { calculateLine, sumBreakdowns } from "@/lib/shop/money";
import type { CartView } from "@/lib/shop/types";
import { CommerceError } from "@/server/commerce/errors";
import { priceProduct } from "@/server/commerce/pricing";
import { getPrisma } from "@/server/db/prisma";
import { calculateCouponDiscount } from "@/server/shop/coupons";

export const CART_COOKIE_NAME = process.env.SHOP_CART_COOKIE_NAME ?? "privazy_cart_id";

export type CartViewResult = Awaited<ReturnType<typeof getCartViewByToken>>;

export function createCartToken() {
  return randomBytes(32).toString("base64url");
}

export async function getCartViewByToken(cartToken?: string | null): Promise<CartView> {
  if (!cartToken) return emptyCartView();
  if (!hasDatabaseUrl()) return emptyCartView();

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
    where: { anonymousId: hashCartToken(cartToken) },
  });

  if (!cart || cart.status !== "ACTIVE") return emptyCartView();
  return mapCartToView(cart);
}

export async function addCartItem(input: { productSlug: string; quantity?: number; sessionToken?: string | null }) {
  const prisma = getPrisma();
  const priced = await priceProduct({
    currency: "PLN",
    productSlug: input.productSlug,
    quantity: input.quantity ?? 1,
  });
  const quantity = priced.quantity;
  const cartToken = input.sessionToken || createCartToken();

  const result = await prisma.$transaction(async (tx) => {
    const cart = await getOrCreateCart(tx, cartToken);
    const product = priced.product;

    const existing = await tx.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variantId: null,
      },
    });

    const snapshot = buildProductSnapshot(product);
    const nextQuantity = existing ? Math.min(10, existing.quantity + quantity) : quantity;
    const line = calculateLine({
      currency: product.currency,
      quantity: nextQuantity,
      unitNetCents: product.priceNetCents,
      vatRateBps: product.vatRateBps,
    });

    if (existing) {
      await tx.cartItem.update({
        data: {
          currency: product.currency,
          productSnapshot: snapshot,
          quantity: nextQuantity,
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
    return cartToken;
  });

  return {
    cart: await getCartViewByToken(result),
    sessionToken: result,
  };
}

export async function updateCartItem(input: { itemId: string; quantity: number; sessionToken?: string | null }) {
  if (!input.sessionToken) throw new CommerceError("not_found", "Brak koszyka.", 404);

  const quantity = Math.max(0, Math.min(10, input.quantity));
  const prisma = getPrisma();

  await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({ where: { anonymousId: hashCartToken(input.sessionToken ?? "") } });
    if (!cart || cart.status !== "ACTIVE") {
      throw new CommerceError("not_found", "Koszyk jest niedostępny.", 404);
    }

    const item = await tx.cartItem.findFirst({
      include: { product: true },
      where: { cartId: cart.id, id: input.itemId },
    });
    if (!item) throw new CommerceError("not_found", "Pozycja koszyka nie istnieje.", 404);

    if (quantity === 0) {
      await tx.cartItem.delete({ where: { id: item.id } });
    } else {
      if (item.product.status !== "ACTIVE") {
        throw new CommerceError("conflict", "Produkt nie jest już dostępny.", 409);
      }
      await tx.cartItem.update({
        data: {
          currency: item.product.currency,
          productSnapshot: buildProductSnapshot(item.product),
          quantity,
          unitNetCents: item.product.priceNetCents,
          vatRateBps: item.product.vatRateBps,
        },
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

async function getOrCreateCart(tx: Prisma.TransactionClient, cartToken: string) {
  const anonymousId = hashCartToken(cartToken);
  const existing = await tx.cart.findUnique({ where: { anonymousId } });
  if (existing && existing.status === "ACTIVE") return existing;

  return tx.cart.create({
    data: {
      anonymousId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
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
    status: cart.status,
    subtotalNetCents: cart.subtotalNetCents,
    totalGrossCents: cart.totalGrossCents,
    vatCents: cart.vatCents,
  };
}

function emptyCartView() {
  return {
    coupon: null,
    currency: "PLN",
    discountCents: 0,
    id: null,
    itemCount: 0,
    items: [],
    status: "ACTIVE",
    subtotalNetCents: 0,
    totalGrossCents: 0,
    vatCents: 0,
  } satisfies CartView;
}

export function hashCartToken(cartToken: string) {
  return createHash("sha256").update(cartToken).digest("hex");
}

function hasDatabaseUrl() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== "replace_in_private_env") return true;
  if (process.env.NODE_ENV === "production") throw new Error("Missing DATABASE_URL for cart reads.");
  return false;
}
