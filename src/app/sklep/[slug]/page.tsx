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

  const seo = getProductSeo(product.metadata);

  return {
    title: seo.title ?? `${product.name} - sklep PRIVAZY`,
    description: seo.description ?? product.shortDescription,
    alternates: {
      canonical: `/sklep/${product.slug}`,
    },
    openGraph: {
      description: seo.description ?? product.shortDescription,
      title: seo.title ?? product.name,
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

function getProductSeo(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};

  const candidate = metadata as { seoDescription?: unknown; seoTitle?: unknown };
  return {
    description: typeof candidate.seoDescription === "string" ? candidate.seoDescription : undefined,
    title: typeof candidate.seoTitle === "string" ? candidate.seoTitle : undefined,
  };
}
