import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShopProductDetail } from "@/components/shop/shop-components";
import { getCommerceFlags } from "@/server/commerce/flags";
import { getShopProductBySlug } from "@/server/shop/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Polityka prywatnosci RODO - sklep PRIVAZY",
  description: "Testowy produkt polityki prywatności RODO w checkoutcie mock/sandbox.",
  alternates: {
    canonical: "/sklep/polityka-prywatnosci",
  },
};

export default async function PrivacyPolicyProductRoute() {
  const product = await getShopProductBySlug("polityka-prywatnosci");
  const flags = getCommerceFlags();

  if (!product) notFound();

  return <ShopProductDetail checkoutEnabled={flags.checkoutEnabled} product={product} />;
}
