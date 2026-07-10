import Link from "next/link";
import type { Metadata } from "next";

import { BlogFooter, BlogHeader } from "@/components/blog/blog-chrome";
import { Badge } from "@/components/ui/badge";
import { listPublicPosts } from "@/server/cms/posts-service";

type TagPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Tag ${slug} - Blog PRIVAZY`,
    alternates: { canonical: `/blog/tag/${slug}` },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const posts = await listPublicPosts({ tagSlug: slug, limit: 12 });

  return (
    <main className="min-h-screen bg-[var(--surface-page)]">
      <BlogHeader />
      <section className="py-10 lg:py-14 pvz-container">
        <Badge tone="outline">Tag</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-normal">Wpisy z tagiem: {slug}</h1>
        <PostGrid posts={posts.items} />
      </section>
      <BlogFooter />
    </main>
  );
}

function PostGrid({ posts }: { posts: Awaited<ReturnType<typeof listPublicPosts>>["items"] }) {
  if (posts.length === 0) {
    return <p className="mt-6 rounded-[var(--radius-sm)] border bg-white p-6 text-[var(--text-muted)]">Brak opublikowanych wpisow.</p>;
  }

  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`} className="rounded-[var(--radius-sm)] border bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="text-xl font-bold tracking-normal">{post.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--text-body)]">{post.excerpt}</p>
        </Link>
      ))}
    </div>
  );
}
