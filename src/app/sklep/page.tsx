import type { Metadata } from "next";

import { ShopCatalogPage } from "@/components/shop/shop-components";
import { getCommerceFlags } from "@/server/commerce/flags";
import { listShopProducts } from "@/server/shop/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sklep PRIVAZY - dokumenty RODO i pakiety",
  description: "Katalog testowy dokumentów RODO i pakietów w checkoutcie mock/sandbox PRIVAZY.",
};

export default async function ShopPage() {
  const products = await listShopProducts();
  const flags = getCommerceFlags();

  return <ShopCatalogPage checkoutEnabled={flags.checkoutEnabled} products={products} />;
}
