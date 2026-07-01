import type { Metadata } from "next";

import { BlogFooter, BlogHeader } from "@/components/blog/blog-chrome";
import { BlogIndexClient } from "@/components/blog/blog-index-client";
import { blogArticles } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog PRIVAZY - RODO, IOD i ochrona danych",
  description:
    "Praktyczne artykuły o RODO, obowiązku IOD, dokumentacji ochrony danych i zmianach w prawie dla firm.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog PRIVAZY - RODO, IOD i ochrona danych",
    description:
      "Praktyczne artykuły o RODO, obowiązku IOD, dokumentacji ochrony danych i zmianach w prawie dla firm.",
    url: "/blog",
  },
};

export default function BlogPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-slate-50 text-slate-950">
      <BlogHeader />
      <BlogIndexClient articles={blogArticles} />
      <BlogFooter />
    </main>
  );
}
