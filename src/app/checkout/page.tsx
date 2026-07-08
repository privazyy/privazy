import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CheckoutForm } from "@/components/shop/shop-client";
import { ShopShell } from "@/components/shop/shop-components";
import { CART_COOKIE_NAME, getCartViewByToken } from "@/server/shop/cart";
import { getCommerceFlags } from "@/server/commerce/flags";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout - PRIVAZY",
  description: "Dane testowego zamówienia i jawna symulacja płatności mock PRIVAZY.",
};

export default async function CheckoutPage() {
  const flags = getCommerceFlags();
  if (!flags.checkoutEnabled) {
    return (
      <ShopShell checkoutEnabled={false}>
        <section className="py-16 text-center pvz-container">
          <h1 className="text-[var(--fs-h1)] font-bold">Checkout sandbox jest wyłączony</h1>
          <p className="mt-3 text-[var(--text-body)]">Ta instalacja nie przyjmuje zamówień ani płatności.</p>
        </section>
      </ShopShell>
    );
  }

  const cookieStore = await cookies();
  const cart = await getCartViewByToken(cookieStore.get(CART_COOKIE_NAME)?.value);

  return (
    <ShopShell checkoutEnabled>
      <CheckoutForm cart={cart} />
    </ShopShell>
  );
}
