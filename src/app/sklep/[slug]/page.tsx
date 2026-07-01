import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShopProductDetail } from "@/components/shop/shop-components";
import { getShopProductBySlug } from "@/server/shop/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getShopProductBySlug(slug);

  if (!product) {
    return {
      title: "Produkt PRIVAZY",
    };
  }

  return {
    title: `${product.name} - sklep PRIVAZY`,
    description: product.shortDescription,
    alternates: {
      canonical: `/sklep/${product.slug}`,
    },
    openGraph: {
      description: product.shortDescription,
      title: product.name,
      type: "website",
      url: `/sklep/${product.slug}`,
    },
  };
}

export default async function ShopProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getShopProductBySlug(slug);

  if (!product) notFound();

  return <ShopProductDetail product={product} />;
}
