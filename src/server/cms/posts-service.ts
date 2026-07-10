import "server-only";

import { Prisma, type BlogPostStatus } from "@prisma/client";
import type { z } from "zod";

import { assertCmsMutation, type CmsActor } from "@/server/cms/cms-permissions";
import type { cmsPostCreateSchema, cmsPostListQuerySchema, cmsPostUpdateSchema, publicPostListQuerySchema } from "@/server/cms/schemas";
import { serializeCmsPost, serializePublicPost, serializePublicPostListItem } from "@/server/cms/serializers";
import { getPrisma } from "@/server/db/prisma";

type CmsPostCreateInput = z.infer<typeof cmsPostCreateSchema>;
type CmsPostUpdateInput = z.infer<typeof cmsPostUpdateSchema>;
type CmsPostListInput = z.infer<typeof cmsPostListQuerySchema>;
type PublicPostListInput = z.infer<typeof publicPostListQuerySchema>;

export class CmsServiceError extends Error {
  constructor(
    public readonly status: 400 | 404 | 409,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "CmsServiceError";
  }
}

const cmsPostInclude = {
  author: { select: { id: true, name: true, email: true, role: true } },
  reviewer: { select: { id: true, name: true, email: true, role: true } },
  categories: { include: { category: true }, orderBy: { createdAt: "asc" as const } },
  tags: { include: { tag: true }, orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.BlogPostInclude;

const publicPostInclude = {
  author: { select: { id: true, name: true } },
  categories: { include: { category: true }, orderBy: { createdAt: "asc" as const } },
  tags: { include: { tag: true }, orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.BlogPostInclude;

export async function listPublicPosts(input: PublicPostListInput) {
  const rows = await getPrisma().blogPost.findMany({
    where: publicWhere(input),
    include: publicPostInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;

  return {
    items: items.map(serializePublicPostListItem),
    nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
  };
}

export async function getPublicPostBySlug(slug: string) {
  const post = await getPrisma().blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: publicPostInclude,
  });
  if (!post) throw new CmsServiceError(404, "NOT_FOUND", "Nie znaleziono opublikowanego wpisu.");
  return serializePublicPost(post);
}

export async function listCmsPosts(input: CmsPostListInput) {
  const rows = await getPrisma().blogPost.findMany({
    where: cmsWhere(input),
    include: cmsPostInclude,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;

  return {
    items: items.map(serializeCmsPost),
    nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
  };
}

export async function getCmsPost(id: string) {
  const post = await getPrisma().blogPost.findUnique({ where: { id }, include: cmsPostInclude });
  if (!post) throw new CmsServiceError(404, "NOT_FOUND", "Nie znaleziono wpisu.");
  return serializeCmsPost(post);
}

export async function createPost(input: CmsPostCreateInput, actor: CmsActor) {
  assertCmsMutation(actor, input.status === "PUBLISHED" ? "publish" : "create");
  await assertRelations(input.categoryIds, input.tagIds);

  const prisma = getPrisma();
  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.blogPost.create({
      data: {
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        status: input.status,
        authorId: actor.id,
        reviewerId: input.reviewerId,
        publishedAt: input.status === "PUBLISHED" ? input.publishedAt ?? new Date() : input.publishedAt ?? null,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        canonicalUrl: input.canonicalUrl,
        coverImageFileId: input.coverImageFileId,
        categories: { create: input.categoryIds.map((categoryId) => ({ categoryId })) },
        tags: { create: input.tagIds.map((tagId) => ({ tagId })) },
      },
      include: cmsPostInclude,
    });
    await writeCmsAudit(tx, actor, "cms.post.created", "BlogPost", created.id, {
      status: created.status,
      slug: created.slug,
    });
    return created;
  });

  return serializeCmsPost(post);
}

export async function updatePost(id: string, input: CmsPostUpdateInput, actor: CmsActor) {
  assertCmsMutation(actor, input.status === "PUBLISHED" ? "publish" : "update");
  await assertPostExists(id);
  await assertRelations(input.categoryIds, input.tagIds);

  const prisma = getPrisma();
  const post = await prisma.$transaction(async (tx) => {
    if (input.categoryIds) {
      await tx.postCategory.deleteMany({ where: { postId: id } });
      if (input.categoryIds.length > 0) {
        await tx.postCategory.createMany({ data: input.categoryIds.map((categoryId) => ({ postId: id, categoryId })) });
      }
    }
    if (input.tagIds) {
      await tx.postTag.deleteMany({ where: { postId: id } });
      if (input.tagIds.length > 0) {
        await tx.postTag.createMany({ data: input.tagIds.map((tagId) => ({ postId: id, tagId })) });
      }
    }

    const updated = await tx.blogPost.update({
      where: { id },
      data: {
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        status: input.status,
        reviewerId: input.reviewerId,
        publishedAt: input.status === "PUBLISHED" ? input.publishedAt ?? new Date() : input.publishedAt,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        canonicalUrl: input.canonicalUrl,
        coverImageFileId: input.coverImageFileId,
      },
      include: cmsPostInclude,
    });
    await writeCmsAudit(tx, actor, "cms.post.updated", "BlogPost", id, {
      changedFields: Object.keys(input),
      status: updated.status,
    });
    return updated;
  });

  return serializeCmsPost(post);
}

export async function submitPostForReview(id: string, actor: CmsActor) {
  assertCmsMutation(actor, "submitReview");
  return setPostStatus(id, "IN_REVIEW", actor, "cms.post.submitted_for_review");
}

export async function publishPost(id: string, actor: CmsActor) {
  assertCmsMutation(actor, "publish");
  return setPostStatus(id, "PUBLISHED", actor, "cms.post.published");
}

export async function archivePost(id: string, actor: CmsActor) {
  assertCmsMutation(actor, "archive");
  return setPostStatus(id, "ARCHIVED", actor, "cms.post.archived");
}

async function setPostStatus(id: string, status: BlogPostStatus, actor: CmsActor, action: string) {
  const prisma = getPrisma();
  const post = await prisma.$transaction(async (tx) => {
    const existing = await tx.blogPost.findUnique({ where: { id }, select: { id: true, status: true, publishedAt: true } });
    if (!existing) throw new CmsServiceError(404, "NOT_FOUND", "Nie znaleziono wpisu.");

    const updated = await tx.blogPost.update({
      where: { id },
      data: {
        status,
        reviewerId: status === "IN_REVIEW" || status === "PUBLISHED" ? actor.id : undefined,
        publishedAt: status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt,
      },
      include: cmsPostInclude,
    });
    await writeCmsAudit(tx, actor, action, "BlogPost", id, {
      beforeStatus: existing.status,
      afterStatus: status,
    });
    return updated;
  });

  return serializeCmsPost(post);
}

function publicWhere(input: PublicPostListInput): Prisma.BlogPostWhereInput {
  return {
    status: "PUBLISHED",
    ...(input.q
      ? {
          OR: [
            { title: { contains: input.q, mode: "insensitive" } },
            { excerpt: { contains: input.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(input.categorySlug ? { categories: { some: { category: { slug: input.categorySlug } } } } : {}),
    ...(input.tagSlug ? { tags: { some: { tag: { slug: input.tagSlug } } } } : {}),
  };
}

function cmsWhere(input: CmsPostListInput): Prisma.BlogPostWhereInput {
  return {
    ...(input.status ? { status: input.status } : {}),
    ...(input.q
      ? {
          OR: [
            { title: { contains: input.q, mode: "insensitive" } },
            { excerpt: { contains: input.q, mode: "insensitive" } },
            { slug: { contains: input.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(input.categorySlug ? { categories: { some: { category: { slug: input.categorySlug } } } } : {}),
    ...(input.tagSlug ? { tags: { some: { tag: { slug: input.tagSlug } } } } : {}),
  };
}

async function assertPostExists(id: string) {
  const post = await getPrisma().blogPost.findUnique({ where: { id }, select: { id: true } });
  if (!post) throw new CmsServiceError(404, "NOT_FOUND", "Nie znaleziono wpisu.");
}

async function assertRelations(categoryIds?: string[], tagIds?: string[]) {
  const prisma = getPrisma();
  if (categoryIds && categoryIds.length > 0) {
    const count = await prisma.blogCategory.count({ where: { id: { in: categoryIds } } });
    if (count !== new Set(categoryIds).size) {
      throw new CmsServiceError(400, "INVALID_CATEGORY", "Co najmniej jedna kategoria nie istnieje.");
    }
  }
  if (tagIds && tagIds.length > 0) {
    const count = await prisma.blogTag.count({ where: { id: { in: tagIds } } });
    if (count !== new Set(tagIds).size) {
      throw new CmsServiceError(400, "INVALID_TAG", "Co najmniej jeden tag nie istnieje.");
    }
  }
}

export async function writeCmsAudit(
  tx: Prisma.TransactionClient,
  actor: CmsActor,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown>,
) {
  await tx.auditLog.create({
    data: {
      userId: actor.id,
      action,
      entityType,
      entityId,
      metadata: toJson(metadata),
    },
  });
}

function toJson(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}
