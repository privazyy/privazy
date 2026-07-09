import type { MetadataRoute } from "next";

import { getPublicSiteUrl } from "@/lib/public-site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: ["/admin", "/dashboard", "/client", "/api"],
      userAgent: "*",
    },
    sitemap: getPublicSiteUrl("/sitemap.xml"),
  };
}
