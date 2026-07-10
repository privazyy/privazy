import "server-only";

import type { Prisma } from "@prisma/client";
import type { z } from "zod";

import { assertCmsMutation, type CmsActor } from "@/server/cms/cms-permissions";
import type { cmsCategoryCreateSchema, cmsCategoryUpdateSchema } from "@/server/cms/schemas";
import { serializeCategory } from "@/server/cms/serializers";
import { writeCmsAudit, CmsServiceError } from "@/server/cms/posts-service";
import { getPrisma } from "@/server/db/prisma";

type CategoryCreateInput = z.infer<typeof cmsCategoryCreateSchema>;
type CategoryUpdateInput = z.infer<typeof cmsCategoryUpdateSchema>;

export async function listCategories() {
  const categories = await getPrisma().blogCategory.findMany({ orderBy: [{ name: "asc" }, { id: "asc" }] });
  return categories.map(serializeCategory);
}

export async function createCategory(input: CategoryCreateInput, actor: CmsActor) {
  assertCmsMutation(actor, "create");
  const category = await getPrisma().$transaction(async (tx) => {
    const created = await tx.blogCategory.create({ data: input });
    await writeCmsAudit(tx, actor, "cms.category.created", "BlogCategory", created.id, {
      slug: created.slug,
      name: created.name,
    });
    return created;
  });
  return serializeCategory(category);
}

export async function updateCategory(id: string, input: CategoryUpdateInput, actor: CmsActor) {
  assertCmsMutation(actor, "update");
  const prisma = getPrisma();
  const category = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.blogCategory.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new CmsServiceError(404, "NOT_FOUND", "Nie znaleziono kategorii.");
    const updated = await tx.blogCategory.update({ where: { id }, data: input });
    await writeCmsAudit(tx, actor, "cms.category.updated", "BlogCategory", id, {
      changedFields: Object.keys(input),
    });
    return updated;
  });
  return serializeCategory(category);
}
