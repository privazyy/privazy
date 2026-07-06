import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://privazy.pl").replace(/\/$/, "");

  return {
    rules: {
      allow: ["/", "/blog", "/sklep"],
      disallow: ["/admin", "/admin/blog", "/platforma", "/api"],
      userAgent: "*",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
