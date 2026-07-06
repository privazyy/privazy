import "server-only";

import type { BlogCtaType, BlogPost, BlogPostStatus, Prisma } from "@prisma/client";

import { blogArticles, blogCategories, type BlogArticle, type BlogCategoryKey } from "@/lib/blog";
import { getPrisma } from "@/server/db/prisma";

const publicStatuses: BlogPostStatus[] = ["PUBLISHED", "SCHEDULED"];

type BlogPostWithRelations = BlogPost & {
  author: { email: string; name: string | null } | null;
  category: { description: string | null; name: string; slug: string };
  ctas: Array<{ href: string; label: string; type: BlogCtaType }>;
  faqItems: Array<{ answer: string; question: string }>;
  relatedProducts: Array<{ product: { name: string; shortDescription: string; slug: string } }>;
  relatedServices: Array<{ href: string; label: string }>;
  tags: Array<{ tag: { name: string; slug: string } }>;
};

export type BlogCategoryView = {
  description: string;
  label: string;
  slug: string;
};

export type BlogArticleView = BlogArticle & {
  canonicalUrl?: string | null;
  ctaType: BlogCtaType;
  databaseId?: string;
  faqItems: Array<{ answer: string; question: string }>;
  legalDisclaimer?: string;
  metaDescription: string;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogTitle?: string | null;
  relatedProducts: Array<{ href: string; label: string; text: string }>;
  relatedServices: Array<{ href: string; label: string }>;
  seoTitle?: string | null;
  tags: Array<{ label: string; slug: string }>;
};

const fallbackCategories: BlogCategoryView[] = Object.entries(blogCategories).map(([slug, category]) => ({
  description: category.tag,
  label: category.label,
  slug,
}));

const categoryVisualMap: Record<string, BlogCategoryKey> = {
  "ai-i-dane-osobowe": "prawo",
  "dokumentacja-rodo": "rodo",
  "e-commerce": "poradniki",
  edukacja: "poradniki",
  "hr-i-rekrutacja": "poradniki",
  "inspektor-ochrony-danych": "iod",
  "naruszenia-ochrony-danych": "rodo",
  "placowki-medyczne": "rodo",
  "rodo-dla-firm": "rodo",
  "zadania-osob": "rodo",
};

export function isPublicBlogPost(post: Pick<BlogPost, "publishedAt" | "scheduledAt" | "status">, now = new Date()) {
  if (post.status === "PUBLISHED") return Boolean(post.publishedAt && post.publishedAt <= now);
  if (post.status === "SCHEDULED") return Boolean(post.scheduledAt && post.scheduledAt <= now);
  return false;
}

export async function listPublicBlogArticles() {
  try {
    const posts = await getPrisma().blogPost.findMany({
      include: blogPostInclude,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      where: {
        status: { in: publicStatuses },
        OR: [
          { status: "PUBLISHED", publishedAt: { lte: new Date() } },
          { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
        ],
      },
      take: 60,
    });

    if (posts.length > 0) return posts.map(toArticleView);
  } catch {
    // Local dev and static build can run before CMS migrations are applied.
  }

  return fallbackArticles();
}

export async function getPublicBlogArticle(slug: string) {
  try {
    const post = await getPrisma().blogPost.findUnique({
      include: blogPostInclude,
      where: { slug },
    });

    if (post && isPublicBlogPost(post)) return toArticleView(post);
  } catch {
    // Fall through to migration fallback.
  }

  return fallbackArticles().find((article) => article.slug === slug) ?? null;
}

export async function listBlogCategories() {
  try {
    const categories = await getPrisma().blogCategory.findMany({
      orderBy: { name: "asc" },
      select: { description: true, name: true, slug: true },
    });

    if (categories.length > 0) {
      return categories.map((category) => ({
        description: category.description ?? "Artykuly PRIVAZY w tej kategorii.",
        label: category.name,
        slug: category.slug,
      }));
    }
  } catch {
    // Fallback below.
  }

  return fallbackCategories;
}

export async function listPublicBlogArticlesByCategory(slug: string) {
  const articles = await listPublicBlogArticles();
  const visualKey = categoryVisualMap[slug] ?? (slug as BlogCategoryKey);
  return articles.filter((article) => article.category === visualKey || article.tags.some((tag) => tag.slug === slug));
}

export async function listPublicBlogArticlesByTag(slug: string) {
  const articles = await listPublicBlogArticles();
  return articles.filter((article) => article.tags.some((tag) => tag.slug === slug));
}

export async function getRelatedPublicArticles(article: BlogArticleView, limit = 3) {
  const articles = await listPublicBlogArticles();
  const sameCategory = articles.filter((item) => item.slug !== article.slug && item.category === article.category);
  const rest = articles.filter((item) => item.slug !== article.slug && item.category !== article.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export async function getBlogSitemapEntries() {
  const articles = await listPublicBlogArticles();
  return articles.map((article) => ({
    lastModified: new Date(article.updated),
    slug: article.slug,
  }));
}

function fallbackArticles(): BlogArticleView[] {
  return blogArticles.map((article) => ({
    ...article,
    ctaType: "CHECK_IOD",
    faqItems: [],
    legalDisclaimer: "Tresci maja charakter ogolny i nie stanowia indywidualnej porady prawnej.",
    metaDescription: article.excerpt,
    relatedProducts: [],
    relatedServices: [{ href: "/#services", label: "Uslugi PRIVAZY" }],
    tags: [{ label: blogCategories[article.category].tag, slug: article.category }],
  }));
}

const blogPostInclude = {
  author: { select: { email: true, name: true } },
  category: { select: { description: true, name: true, slug: true } },
  ctas: { orderBy: { position: "asc" }, select: { href: true, label: true, type: true } },
  faqItems: { orderBy: { position: "asc" }, select: { answer: true, question: true } },
  relatedProducts: {
    orderBy: { position: "asc" },
    select: { product: { select: { name: true, shortDescription: true, slug: true } } },
  },
  relatedServices: { orderBy: { position: "asc" }, select: { href: true, label: true } },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
} satisfies Prisma.BlogPostInclude;

function toArticleView(post: BlogPostWithRelations): BlogArticleView {
  const category = categoryVisualMap[post.category.slug] ?? "rodo";
  const sections = markdownToSections(post.content);
  const published = post.publishedAt ?? post.scheduledAt ?? post.createdAt;

  return {
    author: post.author?.name ?? post.author?.email ?? "Zespol PRIVAZY",
    authorInitials: initials(post.author?.name ?? post.author?.email ?? "PRIVAZY"),
    canonicalUrl: post.canonicalUrl,
    category,
    coverNote: post.category.name,
    ctaType: post.ctaType,
    databaseId: post.id,
    date: formatDate(published),
    excerpt: post.excerpt,
    faqItems: post.faqItems,
    heroLabel: post.category.name,
    legalDisclaimer: post.legalDisclaimer,
    metaDescription: post.metaDescription,
    ogDescription: post.ogDescription,
    ogImage: post.ogImage,
    ogTitle: post.ogTitle,
    readTime: `${post.readingTime} min`,
    relatedProducts: post.relatedProducts.map(({ product }) => ({
      href: `/sklep/${product.slug}`,
      label: product.name,
      text: product.shortDescription,
    })),
    relatedServices: post.relatedServices,
    sections,
    seoTitle: post.seoTitle,
    slug: post.slug,
    sources: [],
    summary: sections[0]?.body.slice(0, 3) ?? [post.excerpt],
    tags: post.tags.map(({ tag }) => ({ label: tag.name, slug: tag.slug })),
    title: post.title,
    updated: formatDate(post.updatedAt),
  };
}

function markdownToSections(content: string) {
  const blocks = content.split(/\n(?=##\s+)/).map((block) => block.trim()).filter(Boolean);
  const source = blocks.length > 0 ? blocks : [content];

  return source.map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const heading = lines[0]?.startsWith("## ") ? lines.shift()?.replace(/^##\s+/, "") : `Sekcja ${index + 1}`;
    const body = lines.length > 0 ? lines : [content.replace(/^##\s+/gm, "").trim()];

    return {
      body,
      id: slugify(heading ?? `sekcja-${index + 1}`),
      title: heading ?? `Sekcja ${index + 1}`,
    };
  });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function initials(value: string) {
  return value.split(/\s+|@/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
