import "server-only";

import type { Prisma } from "@prisma/client";
import type { z } from "zod";

import { assertCmsMutation, type CmsActor } from "@/server/cms/cms-permissions";
import type { cmsTagCreateSchema, cmsTagUpdateSchema } from "@/server/cms/schemas";
import { serializeTag } from "@/server/cms/serializers";
import { writeCmsAudit, CmsServiceError } from "@/server/cms/posts-service";
import { getPrisma } from "@/server/db/prisma";

type TagCreateInput = z.infer<typeof cmsTagCreateSchema>;
type TagUpdateInput = z.infer<typeof cmsTagUpdateSchema>;

export async function listTags() {
  const tags = await getPrisma().blogTag.findMany({ orderBy: [{ name: "asc" }, { id: "asc" }] });
  return tags.map(serializeTag);
}

export async function createTag(input: TagCreateInput, actor: CmsActor) {
  assertCmsMutation(actor, "create");
  const tag = await getPrisma().$transaction(async (tx) => {
    const created = await tx.blogTag.create({ data: input });
    await writeCmsAudit(tx, actor, "cms.tag.created", "BlogTag", created.id, {
      slug: created.slug,
      name: created.name,
    });
    return created;
  });
  return serializeTag(tag);
}

export async function updateTag(id: string, input: TagUpdateInput, actor: CmsActor) {
  assertCmsMutation(actor, "update");
  const prisma = getPrisma();
  const tag = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.blogTag.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new CmsServiceError(404, "NOT_FOUND", "Nie znaleziono tagu.");
    const updated = await tx.blogTag.update({ where: { id }, data: input });
    await writeCmsAudit(tx, actor, "cms.tag.updated", "BlogTag", id, {
      changedFields: Object.keys(input),
    });
    return updated;
  });
  return serializeTag(tag);
}
