import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CheckoutForm } from "@/components/shop/shop-client";
import { ShopShell } from "@/components/shop/shop-components";
import { CART_COOKIE_NAME, getCartViewByToken } from "@/server/shop/cart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout - PRIVAZY",
  description: "Dane do zamowienia, platnosc i faktura za dokumenty PRIVAZY.",
};

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const cart = await getCartViewByToken(cookieStore.get(CART_COOKIE_NAME)?.value);

  return (
    <ShopShell>
      <CheckoutForm cart={cart} />
    </ShopShell>
  );
}
