import "server-only";

import type { Product, ProductVariant } from "@prisma/client";

import { starterProducts } from "@/lib/shop/products";
import { getPrisma } from "@/server/db/prisma";

export type ShopProduct = Pick<
  Product,
  | "currency"
  | "description"
  | "expectedDelivery"
  | "id"
  | "includedFiles"
  | "legalDisclaimer"
  | "metadata"
  | "name"
  | "priceNetCents"
  | "productType"
  | "shortDescription"
  | "slug"
  | "status"
  | "vatRateBps"
> & {
  variants?: ProductVariant[];
};

export async function listShopProducts(options: { includeDrafts?: boolean; type?: string } = {}) {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL === "replace_in_private_env") {
    return fallbackProducts(options);
  }

  try {
    const products = await getPrisma().product.findMany({
      include: { variants: true },
      orderBy: [{ productType: "asc" }, { priceNetCents: "asc" }],
      where: {
        ...(options.includeDrafts ? {} : { status: "ACTIVE" }),
        ...(options.type ? { productType: options.type as never } : {}),
      },
    });

    return products as ShopProduct[];
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Using starter shop products because database catalog is unavailable.", error);
      return fallbackProducts(options);
    }

    throw error;
  }
}

export async function getShopProductBySlug(slug: string) {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL === "replace_in_private_env") {
    return fallbackProducts({ includeDrafts: true }).find((product) => product.slug === slug) ?? null;
  }

  const product = await getPrisma().product.findUnique({
    include: { variants: true },
    where: { slug },
  });

  if (!product || product.status === "ARCHIVED") return null;
  return product as ShopProduct;
}

function fallbackProducts(options: { includeDrafts?: boolean; type?: string }) {
  return starterProducts
    .filter((product) => options.includeDrafts || product.status === "ACTIVE")
    .filter((product) => !options.type || product.productType === options.type)
    .map((product, index) => ({
      ...product,
      createdAt: new Date(0),
      id: `starter-${index}`,
      includedFiles: product.includedFiles,
      metadata: product.metadata ?? null,
      updatedAt: new Date(0),
      variants: [],
    })) as unknown as ShopProduct[];
}
