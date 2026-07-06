import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticlePage } from "@/components/blog/blog-article-page";
import { getPublicBlogArticle, getRelatedPublicArticles } from "@/server/blog/data";

type BlogArticleRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({ params }: BlogArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicBlogArticle(slug);

  if (!article) {
    return {
      robots: { follow: false, index: false },
      title: "Artykul nie znaleziony - PRIVAZY",
    };
  }

  const description = article.metaDescription ?? article.excerpt;

  return {
    alternates: {
      canonical: article.canonicalUrl ?? `/blog/${article.slug}`,
    },
    description,
    openGraph: {
      authors: [article.author],
      description: article.ogDescription ?? description,
      images: article.ogImage ? [article.ogImage] : undefined,
      publishedTime: article.date,
      title: article.ogTitle ?? article.title,
      type: "article",
    },
    title: article.seoTitle ?? `${article.title} - Blog PRIVAZY`,
  };
}

export default async function BlogArticleRoute({ params }: BlogArticleRouteProps) {
  const { slug } = await params;
  const article = await getPublicBlogArticle(slug);

  if (!article) notFound();

  const related = await getRelatedPublicArticles(article, 3);
  return <BlogArticlePage article={article} related={related} />;
}
