import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Search } from "lucide-react";

import { BlogFooter, BlogHeader } from "@/components/blog/blog-chrome";
import { NewsletterSignup } from "@/components/newsletter/newsletter-signup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listPublicPosts } from "@/server/cms/posts-service";
import { estimateReadTime } from "@/server/cms/serializers";

export const metadata: Metadata = {
  title: "Blog PRIVAZY - RODO, IOD i ochrona danych",
  description: "Praktyczne artykuly o RODO, obowiazku IOD, dokumentacji ochrony danych i zmianach w prawie dla firm.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog PRIVAZY",
    description: "Praktyczne artykuly o RODO, IOD i ochronie danych.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type BlogPageProps = {
  searchParams: Promise<{ q?: string; cursor?: string }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const query = await searchParams;
  const posts = await listPublicPosts({ q: query.q, cursor: query.cursor, limit: 12 });
  const featured = posts.items[0];

  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--surface-page)] text-[var(--text-strong)]">
      <BlogHeader />
      <section className="border-b border-[var(--border-subtle)] bg-white">
        <div className="grid gap-8 py-10 lg:grid-cols-[1fr_360px] lg:py-14 pvz-container">
          <div className="min-w-0">
            <span className="font-mono text-xs font-medium uppercase tracking-normal text-[var(--text-muted)]">
              Blog PRIVAZY
            </span>
            <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight tracking-normal sm:text-5xl">
              Wiedza o RODO, IOD i zgodnym marketingu
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--text-body)]">
              Dynamiczne wpisy z CMS. Publiczna lista pokazuje wylacznie status PUBLISHED.
            </p>
            {featured && (
              <Button asChild size="lg" className="mt-7">
                <Link href={`/blog/${featured.slug}`}>
                  Najnowszy wpis <ArrowRight className="size-5" />
                </Link>
              </Button>
            )}
          </div>
          <form className="grid content-start gap-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor="blog-search">
              Szukaj
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input id="blog-search" name="q" defaultValue={query.q ?? ""} placeholder="Fraza, temat, kategoria" className="pl-9" />
            </div>
            <Button type="submit" variant="outline">
              Filtruj
            </Button>
          </form>
        </div>
      </section>

      <section className="py-10 lg:py-14 pvz-container">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold leading-tight tracking-normal">Opublikowane artykuly</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Drafty i wpisy w review nie sa widoczne publicznie.
            </p>
          </div>
          <span className="font-mono text-sm text-[var(--text-muted)]">{posts.items.length} wynikow</span>
        </div>
        {posts.items.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.items.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="flex min-h-72 flex-col rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white p-5 shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--border-brand)] hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex flex-wrap gap-2">
                  {post.categories.slice(0, 2).map((category) => (
                    <Badge key={category.id} tone="brand">
                      {category.name}
                    </Badge>
                  ))}
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag.id} tone="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
                <h3 className="mt-4 text-xl font-bold leading-snug tracking-normal">{post.title}</h3>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-[var(--text-body)]">{post.excerpt}</p>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-muted)]">
                  <span>{post.publishedAt ? formatDate(post.publishedAt) : "Bez daty publikacji"}</span>
                  <span>{estimateReadTime(post.excerpt)} min</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white p-8 text-center">
            <h3 className="text-xl font-bold">Brak opublikowanych wpisow</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              CMS jest gotowy na publikacje, ale publiczna lista pozostaje pusta dopoki wpis nie ma statusu PUBLISHED.
            </p>
          </div>
        )}
      </section>
      <NewsletterSignup source="blog" />
      <BlogFooter />
    </main>
  );
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium" }).format(new Date(value));
}
