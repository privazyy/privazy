import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BlogFooter, BlogHeader } from "@/components/blog/blog-chrome";
import { NewsletterSignup } from "@/components/newsletter/newsletter-signup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicPostBySlug, CmsServiceError } from "@/server/cms/posts-service";
import { estimateReadTime } from "@/server/cms/serializers";

type BlogArticleRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({ params }: BlogArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPublicPostBySlug(slug);
    return {
      title: `${post.seoTitle || post.title} - Blog PRIVAZY`,
      description: post.seoDescription || post.excerpt,
      alternates: {
        canonical: post.canonicalUrl || `/blog/${post.slug}`,
      },
      openGraph: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        type: "article",
        publishedTime: post.publishedAt?.toISOString(),
        authors: post.author.name ? [post.author.name] : undefined,
      },
    };
  } catch (error) {
    if (error instanceof CmsServiceError && error.status === 404) {
      return { title: "Artykul nie znaleziony - PRIVAZY" };
    }
    throw error;
  }
}

export default async function BlogArticleRoute({ params }: BlogArticleRouteProps) {
  const { slug } = await params;
  let post: Awaited<ReturnType<typeof getPublicPostBySlug>>;

  try {
    post = await getPublicPostBySlug(slug);
  } catch (error) {
    if (error instanceof CmsServiceError && error.status === 404) notFound();
    throw error;
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-[var(--text-strong)]">
      <BlogHeader />
      <article>
        <header className="border-b border-[var(--border-subtle)] bg-[var(--surface-brand-soft)]">
          <div className="mx-auto w-full max-w-4xl px-[var(--gutter)] py-10 lg:py-16">
            <Button asChild variant="ghost" className="mb-6">
              <Link href="/blog">
                <ArrowLeft className="size-4" /> Blog
              </Link>
            </Button>
            <div className="flex flex-wrap gap-2">
              {post.categories.map((category) => (
                <Link key={category.id} href={`/blog/kategoria/${category.slug}`}>
                  <Badge tone="brand">{category.name}</Badge>
                </Link>
              ))}
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                  <Badge tone="outline">{tag.name}</Badge>
                </Link>
              ))}
            </div>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-normal sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-[var(--text-body)]">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
              <span>{post.author.name || "Zespol PRIVAZY"}</span>
              <span>{post.publishedAt ? formatDate(post.publishedAt) : "Bez daty publikacji"}</span>
              <span>{estimateReadTime(post.content)} min czytania</span>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-4xl px-[var(--gutter)] py-10 lg:py-14">
          <div className="space-y-6">
            {renderContent(post.content)}
          </div>
          <div className="mt-10 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-5">
            <h2 className="text-sm font-bold uppercase tracking-normal text-[var(--text-muted)]">Nota</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
              Tresci maja charakter informacyjny i nie sa porada prawna dla konkretnej sprawy.
            </p>
          </div>
        </div>
      </article>
      <NewsletterSignup source={`blog:${post.slug}`} />
      <BlogFooter />
    </main>
  );
}

function renderContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("### ")) {
        return (
          <h3 key={block} className="pt-4 text-2xl font-bold leading-tight tracking-normal">
            {block.slice(4)}
          </h3>
        );
      }
      if (block.startsWith("## ")) {
        return (
          <h2 key={block} className="pt-6 text-3xl font-bold leading-tight tracking-normal">
            {block.slice(3)}
          </h2>
        );
      }
      return (
        <p key={block} className="text-base leading-8 text-[var(--text-body)] sm:text-lg">
          {block}
        </p>
      );
    });
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium" }).format(new Date(value));
}
