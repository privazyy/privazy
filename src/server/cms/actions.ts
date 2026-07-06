"use server";

import { BlogPostStatus, Prisma } from "@prisma/client";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireCrmActor } from "@/server/crm/permissions";
import { getPrisma } from "@/server/db/prisma";
import { assertCanEditCmsDraft, assertCanTransitionCms } from "@/server/cms/permissions";

const requiredText = z.string().trim().min(2).max(20_000);
const optionalText = z.string().trim().max(4000).optional();

const cmsPostSchema = z.object({
  canonicalUrl: optionalText,
  categorySlug: z.string().trim().min(2).max(120),
  content: requiredText,
  ctaType: z.enum(["CHECK_IOD", "SHOP_PRODUCT", "SERVICE_CONTACT", "NEWSLETTER", "CONSULTATION", "RELATED_ARTICLE", "NONE"]).default("CHECK_IOD"),
  excerpt: z.string().trim().min(40).max(600),
  faqAnswer: optionalText,
  faqQuestion: optionalText,
  legalDisclaimer: z.string().trim().min(20).max(1200),
  metaDescription: z.string().trim().min(80).max(180),
  ogDescription: optionalText,
  ogImage: optionalText,
  ogTitle: optionalText,
  postId: z.string().trim().optional(),
  scheduledAt: z.coerce.date().optional(),
  seoTitle: optionalText,
  slug: z.string().trim().min(3).max(160),
  status: z.nativeEnum(BlogPostStatus).default("DRAFT"),
  tags: optionalText,
  title: z.string().trim().min(8).max(180),
});

function formObject(formData: FormData) {
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [
      key,
      typeof value === "string" && value.trim() === "" ? undefined : value,
    ]),
  );
}

export async function saveCmsPostAction(formData: FormData) {
  const actor = await requireCrmActor();
  assertCanEditCmsDraft(actor);

  const input = cmsPostSchema.parse(formObject(formData));
  assertCanTransitionCms(actor, input.status);
  const prisma = getPrisma();

  const existingSlug = await prisma.blogPost.findUnique({
    select: { id: true },
    where: { slug: input.slug },
  });

  if (existingSlug && existingSlug.id !== input.postId) {
    throw new Error("Slug jest juz zajety przez inny wpis.");
  }

  const category = await prisma.blogCategory.upsert({
    create: {
      description: "Kategoria CMS utworzona z formularza redakcyjnego.",
      metaDescription: `Artykuly PRIVAZY w kategorii ${input.categorySlug}.`,
      name: titleFromSlug(input.categorySlug),
      slug: input.categorySlug,
    },
    update: {},
    where: { slug: input.categorySlug },
  });

  const statusData = statusFields(input.status, input.scheduledAt);
  const post = await prisma.$transaction(async (tx) => {
    const saved = input.postId
      ? await tx.blogPost.update({
          data: {
            canonicalUrl: input.canonicalUrl ?? null,
            categoryId: category.id,
            content: input.content,
            ctaType: input.ctaType,
            excerpt: input.excerpt,
            legalDisclaimer: input.legalDisclaimer,
            metaDescription: input.metaDescription,
            ogDescription: input.ogDescription ?? null,
            ogImage: input.ogImage ?? null,
            ogTitle: input.ogTitle ?? null,
            readingTime: estimateReadingTime(input.content),
            reviewerId: input.status === "PUBLISHED" || input.status === "SCHEDULED" ? actor.id : undefined,
            seoTitle: input.seoTitle ?? null,
            slug: input.slug,
            status: input.status,
            title: input.title,
            ...statusData,
          },
          where: { id: input.postId },
        })
      : await tx.blogPost.create({
          data: {
            authorId: actor.id,
            canonicalUrl: input.canonicalUrl ?? null,
            categoryId: category.id,
            content: input.content,
            ctaType: input.ctaType,
            excerpt: input.excerpt,
            legalDisclaimer: input.legalDisclaimer,
            metaDescription: input.metaDescription,
            ogDescription: input.ogDescription ?? null,
            ogImage: input.ogImage ?? null,
            ogTitle: input.ogTitle ?? null,
            readingTime: estimateReadingTime(input.content),
            reviewerId: input.status === "PUBLISHED" || input.status === "SCHEDULED" ? actor.id : null,
            seoTitle: input.seoTitle ?? null,
            slug: input.slug,
            status: input.status,
            title: input.title,
            ...statusData,
          },
        });

    await tx.blogPostTag.deleteMany({ where: { postId: saved.id } });
    for (const tag of parseTags(input.tags)) {
      const savedTag = await tx.blogTag.upsert({
        create: { name: titleFromSlug(tag), slug: tag },
        update: {},
        where: { slug: tag },
      });
      await tx.blogPostTag.create({ data: { postId: saved.id, tagId: savedTag.id } });
    }

    await tx.blogFaqItem.deleteMany({ where: { postId: saved.id } });
    if (input.faqQuestion && input.faqAnswer) {
      await tx.blogFaqItem.create({
        data: {
          answer: input.faqAnswer,
          postId: saved.id,
          question: input.faqQuestion,
        },
      });
    }

    await tx.blogRevision.create({
      data: {
        action: `cms.${input.status.toLowerCase()}`,
        changedById: actor.id,
        changeSummary: `Zapisano status ${input.status}`,
        postId: saved.id,
        snapshot: snapshotForRevision(saved, input) satisfies Prisma.InputJsonObject,
      },
    });

    await tx.auditLog.create({
      data: {
        action: `cms.blog.${input.status.toLowerCase()}`,
        entityId: saved.id,
        entityType: "BlogPost",
        metadata: { slug: saved.slug, status: input.status },
        userId: actor.id,
      },
    });

    return saved;
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  redirect(`/admin/blog/${post.id}/edit` as Route);
}

function statusFields(status: BlogPostStatus, scheduledAt?: Date) {
  if (status === "PUBLISHED") return { archivedAt: null, publishedAt: new Date(), scheduledAt: null };
  if (status === "SCHEDULED") return { archivedAt: null, publishedAt: null, scheduledAt: scheduledAt ?? new Date() };
  if (status === "ARCHIVED") return { archivedAt: new Date() };
  return { archivedAt: null, publishedAt: null, scheduledAt: status === "IN_REVIEW" ? null : scheduledAt ?? null };
}

function estimateReadingTime(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function parseTags(value?: string) {
  return Array.from(new Set((value ?? "").split(",").map((item) => slugify(item)).filter(Boolean))).slice(0, 12);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromSlug(slug: string) {
  return slug.split("-").filter(Boolean).map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

function snapshotForRevision(saved: { id: string; slug: string; status: BlogPostStatus; title: string }, input: z.infer<typeof cmsPostSchema>) {
  return {
    content: input.content,
    excerpt: input.excerpt,
    id: saved.id,
    metaDescription: input.metaDescription,
    slug: saved.slug,
    status: saved.status,
    title: saved.title,
  };
}
