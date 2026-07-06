import type { Metadata } from "next";

import { BlogFooter, BlogHeader } from "@/components/blog/blog-chrome";
import { BlogIndexClient } from "@/components/blog/blog-index-client";
import { listBlogCategories, listPublicBlogArticlesByCategory } from "@/server/blog/data";

type CategoryRouteProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({ params }: CategoryRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await listBlogCategories();
  const category = categories.find((item) => item.slug === slug);

  return {
    description: category?.description ?? "Artykuly PRIVAZY z wybranej kategorii.",
    title: `${category?.label ?? "Kategoria"} - Blog PRIVAZY`,
  };
}

export default async function BlogCategoryPage({ params }: CategoryRouteProps) {
  const { slug } = await params;
  const articles = await listPublicBlogArticlesByCategory(slug);

  return (
    <main className="min-h-screen overflow-x-clip bg-slate-50 text-slate-950">
      <BlogHeader />
      <BlogIndexClient articles={articles} />
      <BlogFooter />
    </main>
  );
}
