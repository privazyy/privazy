import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticlePage } from "@/components/blog/blog-article-page";
import { requireCrmActor } from "@/server/crm/permissions";
import { getCmsPost } from "@/server/cms/data";
import { assertCanReadCms } from "@/server/cms/permissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Preview CMS - PRIVAZY",
};

export default async function BlogPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireCrmActor();
  assertCanReadCms(actor);
  const { id } = await params;
  const post = await getCmsPost(id);
  if (!post) notFound();

  const article = {
    author: post.authorId ?? "Zespol PRIVAZY",
    authorInitials: "PV",
    category: "rodo" as const,
    coverNote: post.category.name,
    ctaType: post.ctaType,
    date: new Intl.DateTimeFormat("pl-PL").format(post.createdAt),
    excerpt: post.excerpt,
    faqItems: post.faqItems,
    heroLabel: post.category.name,
    legalDisclaimer: post.legalDisclaimer,
    metaDescription: post.metaDescription,
    readTime: `${post.readingTime} min`,
    relatedProducts: post.relatedProducts.map(({ product }) => ({ href: `/sklep/${product.slug}`, label: product.name, text: product.shortDescription })),
    relatedServices: post.relatedServices,
    sections: post.content.split(/\n(?=##\s+)/).filter(Boolean).map((block, index) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const title = lines[0]?.replace(/^##\s+/, "") || `Sekcja ${index + 1}`;
      const body = lines[0]?.startsWith("## ") ? lines.slice(1) : lines;
      return { body: body.length ? body : [post.excerpt], id: `preview-${index}`, title };
    }),
    slug: post.slug,
    summary: [post.excerpt],
    title: post.title,
    updated: new Intl.DateTimeFormat("pl-PL").format(post.updatedAt),
  };

  return <BlogArticlePage article={article} related={[]} />;
}
