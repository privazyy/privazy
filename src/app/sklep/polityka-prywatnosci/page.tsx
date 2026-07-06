import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShopProductDetail } from "@/components/shop/shop-components";
import { getShopProductBySlug } from "@/server/shop/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Polityka prywatnosci RODO - sklep PRIVAZY",
  description: "Kup polityke prywatnosci RODO z plikami do wdrozenia, platnoscia online i faktura.",
  alternates: {
    canonical: "/sklep/polityka-prywatnosci",
  },
};

export default async function PrivacyPolicyProductRoute() {
  const product = await getShopProductBySlug("polityka-prywatnosci");

  if (!product) notFound();

  return <ShopProductDetail product={product} />;
}
