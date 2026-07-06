import type { Metadata } from "next";

import { BlogFooter, BlogHeader } from "@/components/blog/blog-chrome";
import { BlogIndexClient } from "@/components/blog/blog-index-client";
import { listPublicBlogArticlesByTag } from "@/server/blog/data";

type TagRouteProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({ params }: TagRouteProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    description: `Artykuly PRIVAZY oznaczone tagiem ${slug}.`,
    title: `${slug} - Blog PRIVAZY`,
  };
}

export default async function BlogTagPage({ params }: TagRouteProps) {
  const { slug } = await params;
  const articles = await listPublicBlogArticlesByTag(slug);

  return (
    <main className="min-h-screen overflow-x-clip bg-slate-50 text-slate-950">
      <BlogHeader />
      <BlogIndexClient articles={articles} />
      <BlogFooter />
    </main>
  );
}
