import type { Metadata } from "next";

import { ShopCatalogPage } from "@/components/shop/shop-components";
import { getCommerceFlags } from "@/server/commerce/flags";
import { listShopProducts } from "@/server/shop/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pakiety PRIVAZY - dokumenty RODO dla firm",
  description: "Pakiety dokumentow PRIVAZY dla mikrofirm, firm standardowych i organizacji wymagajacych szerszego wdrozenia.",
};

export default async function PackagesPage() {
  const products = await listShopProducts({ type: "PACKAGE" });
  const flags = getCommerceFlags();

  return <ShopCatalogPage checkoutEnabled={flags.checkoutEnabled} eyebrow="Pakiety" products={products} title="Pakiety dokumentów RODO dla firm" />;
}
