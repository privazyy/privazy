import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CartPageClient } from "@/components/shop/shop-client";
import { ShopShell } from "@/components/shop/shop-components";
import { CART_COOKIE_NAME, getCartViewByToken } from "@/server/shop/cart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Koszyk - PRIVAZY",
  description: "Koszyk dokumentow i pakietow PRIVAZY.",
};

export default async function CartPage() {
  const cookieStore = await cookies();
  const cart = await getCartViewByToken(cookieStore.get(CART_COOKIE_NAME)?.value);

  return (
    <ShopShell>
      <CartPageClient initialCart={cart} />
    </ShopShell>
  );
}
