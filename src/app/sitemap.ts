import type { MetadataRoute } from "next";

import { getBlogSitemapEntries, listBlogCategories } from "@/server/blog/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://privazy.pl").replace(/\/$/, "");
  const now = new Date();
  const [blogEntries, categories] = await Promise.all([getBlogSitemapEntries(), listBlogCategories()]);

  return [
    { lastModified: now, url: `${baseUrl}/` },
    { lastModified: now, url: `${baseUrl}/blog` },
    { lastModified: now, url: `${baseUrl}/sklep` },
    { lastModified: now, url: `${baseUrl}/sklep/pakiety` },
    ...categories.map((category) => ({
      lastModified: now,
      url: `${baseUrl}/blog/kategoria/${category.slug}`,
    })),
    ...blogEntries.map((entry) => ({
      lastModified: entry.lastModified,
      url: `${baseUrl}/blog/${entry.slug}`,
    })),
  ];
}
