import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CartPageClient } from "@/components/shop/shop-client";
import { ShopShell } from "@/components/shop/shop-components";
import { CART_COOKIE_NAME, getCartViewByToken } from "@/server/shop/cart";
import { getCommerceFlags } from "@/server/commerce/flags";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Koszyk - PRIVAZY",
  description: "Koszyk dokumentow i pakietow PRIVAZY.",
};

export default async function CartPage() {
  const flags = getCommerceFlags();
  if (!flags.checkoutEnabled) {
    return (
      <ShopShell checkoutEnabled={false}>
        <section className="py-16 text-center pvz-container">
          <h1 className="text-[var(--fs-h1)] font-bold">Koszyk sandbox jest wyłączony</h1>
          <p className="mt-3 text-[var(--text-body)]">Ustawienie `ENABLE_CHECKOUT` kontroluje dostęp do operacji koszyka.</p>
        </section>
      </ShopShell>
    );
  }

  const cookieStore = await cookies();
  const cart = await getCartViewByToken(cookieStore.get(CART_COOKIE_NAME)?.value);

  return (
    <ShopShell checkoutEnabled>
      <CartPageClient initialCart={cart} />
    </ShopShell>
  );
}
