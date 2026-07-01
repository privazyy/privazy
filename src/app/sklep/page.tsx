import type { Metadata } from "next";

import { ShopCatalogPage } from "@/components/shop/shop-components";
import { listShopProducts } from "@/server/shop/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sklep PRIVAZY - dokumenty RODO i pakiety",
  description: "Kup dokumenty RODO, pakiety wdrozeniowe i szablony PRIVAZY z checkoutem, platnoscia oraz faktura.",
};

export default async function ShopPage() {
  const products = await listShopProducts();

  return <ShopCatalogPage products={products} />;
}
