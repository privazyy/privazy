import type { MetadataRoute } from "next";

import { blogArticles } from "@/lib/blog";
import { getPublicSiteUrl, publicIndustries, publicServices } from "@/lib/public-site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getPublicSiteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: getPublicSiteUrl("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: getPublicSiteUrl("/sklep/polityka-prywatnosci"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const serviceRoutes = publicServices.map((service) => ({
    url: getPublicSiteUrl(service.path),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const industryRoutes = publicIndustries.map((industry) => ({
    url: getPublicSiteUrl(industry.path),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const articleRoutes = blogArticles.map((article) => ({
    url: getPublicSiteUrl(`/blog/${article.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: article.featured ? 0.75 : 0.65,
  }));

  return [...staticRoutes, ...serviceRoutes, ...industryRoutes, ...articleRoutes];
}
