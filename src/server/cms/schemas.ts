import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug moze zawierac male litery, cyfry i myslniki.");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => value || null);

const relationIds = z.array(z.string().trim().min(1).max(64)).max(20).default([]);

const safeContent = z
  .string()
  .trim()
  .min(20)
  .max(80_000)
  .refine((value) => !/<\s*(script|iframe|object|embed|style|link|meta)\b/i.test(value), {
    message: "Tresc nie moze zawierac niebezpiecznego HTML.",
  });

export const blogPostStatusSchema = z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]);

export const cmsPostCreateSchema = z
  .object({
    slug: slugSchema,
    title: z.string().trim().min(3).max(180),
    excerpt: z.string().trim().min(10).max(420),
    content: safeContent,
    status: blogPostStatusSchema.default("DRAFT"),
    reviewerId: optionalText(64),
    publishedAt: z.coerce.date().nullable().optional(),
    seoTitle: optionalText(180),
    seoDescription: optionalText(260),
    canonicalUrl: z.url().max(500).optional(),
    coverImageFileId: optionalText(120),
    categoryIds: relationIds,
    tagIds: relationIds,
  })
  .strict();

export const cmsPostUpdateSchema = cmsPostCreateSchema
  .partial()
  .extend({
    reviewerId: nullableText(64),
    publishedAt: z.coerce.date().nullable().optional(),
    seoTitle: nullableText(180),
    seoDescription: nullableText(260),
    canonicalUrl: z.url().max(500).nullable().optional(),
    coverImageFileId: nullableText(120),
    categoryIds: relationIds.optional(),
    tagIds: relationIds.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Podaj co najmniej jedno pole.");

export const cmsPostListQuerySchema = z
  .object({
    q: z.string().trim().max(160).optional(),
    status: blogPostStatusSchema.optional(),
    categorySlug: z.string().trim().max(120).optional(),
    tagSlug: z.string().trim().max(120).optional(),
    cursor: z.string().trim().max(64).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export const publicPostListQuerySchema = cmsPostListQuerySchema
  .omit({ status: true })
  .extend({
    limit: z.coerce.number().int().min(1).max(50).default(12),
  })
  .strict();

export const cmsCategoryCreateSchema = z
  .object({
    slug: slugSchema,
    name: z.string().trim().min(2).max(120),
    description: optionalText(500),
  })
  .strict();

export const cmsCategoryUpdateSchema = cmsCategoryCreateSchema
  .partial()
  .extend({ description: nullableText(500) })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Podaj co najmniej jedno pole.");

export const cmsTagCreateSchema = z
  .object({
    slug: slugSchema,
    name: z.string().trim().min(2).max(80),
  })
  .strict();

export const cmsTagUpdateSchema = cmsTagCreateSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Podaj co najmniej jedno pole.");
