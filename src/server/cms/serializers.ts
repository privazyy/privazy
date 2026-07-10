import "server-only";

import type { Prisma } from "@prisma/client";

type CmsPostRecord = Prisma.BlogPostGetPayload<{
  include: {
    author: { select: { id: true; name: true; email: true; role: true } };
    reviewer: { select: { id: true; name: true; email: true; role: true } };
    categories: { include: { category: true } };
    tags: { include: { tag: true } };
  };
}>;

type PublicPostRecord = Prisma.BlogPostGetPayload<{
  include: {
    author: { select: { id: true; name: true } };
    categories: { include: { category: true } };
    tags: { include: { tag: true } };
  };
}>;

export function serializePublicPost(post: PublicPostRecord) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    canonicalUrl: post.canonicalUrl,
    author: post.author,
    categories: post.categories.map(({ category }) => serializeCategory(category)),
    tags: post.tags.map(({ tag }) => serializeTag(tag)),
  };
}

export function serializePublicPostListItem(post: PublicPostRecord) {
  const full = serializePublicPost(post);
  return {
    ...full,
    content: undefined,
  };
}

export function serializeCmsPost(post: CmsPostRecord) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    status: post.status,
    authorId: post.authorId,
    reviewerId: post.reviewerId,
    publishedAt: post.publishedAt,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    canonicalUrl: post.canonicalUrl,
    coverImageFileId: post.coverImageFileId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
    reviewer: post.reviewer,
    categories: post.categories.map(({ category }) => serializeCategory(category)),
    tags: post.tags.map(({ tag }) => serializeTag(tag)),
  };
}

export function serializeCategory(category: { id: string; slug: string; name: string; description?: string | null }) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description ?? null,
  };
}

export function serializeTag(tag: { id: string; slug: string; name: string }) {
  return {
    id: tag.id,
    slug: tag.slug,
    name: tag.name,
  };
}

export function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
