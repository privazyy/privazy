import type { MetadataRoute } from "next";

import { listPublicPosts } from "@/server/cms/posts-service";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  let posts: Awaited<ReturnType<typeof listPublicPosts>>["items"] = [];

  try {
    posts = (await listPublicPosts({ limit: 50 })).items;
  } catch (error) {
    console.error("Sitemap blog query failed", error);
  }

  return [
    {
      url: `${baseUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
