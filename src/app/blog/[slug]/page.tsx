import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticlePage } from "@/components/blog/blog-article-page";
import { blogArticles, getBlogArticle } from "@/lib/blog";

type BlogArticleRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return blogArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: BlogArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) {
    return {
      title: "Artykuł nie znaleziony - PRIVAZY",
    };
  }

  return {
    title: `${article.title} - Blog PRIVAZY`,
    description: article.excerpt,
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: `/blog/${article.slug}`,
      publishedTime: article.date,
      authors: [article.author],
    },
  };
}

export default async function BlogArticleRoute({ params }: BlogArticleRouteProps) {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) notFound();

  return <BlogArticlePage article={article} />;
}
