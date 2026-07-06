import "server-only";

import { getPrisma } from "@/server/db/prisma";

export async function listCmsPosts() {
  return getPrisma().blogPost.findMany({
    include: {
      author: { select: { email: true, name: true } },
      category: { select: { name: true, slug: true } },
      reviewer: { select: { email: true, name: true } },
      _count: { select: { revisions: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}

export async function getCmsPost(id: string) {
  return getPrisma().blogPost.findUnique({
    include: {
      category: true,
      ctas: { orderBy: { position: "asc" } },
      faqItems: { orderBy: { position: "asc" } },
      relatedProducts: { include: { product: true }, orderBy: { position: "asc" } },
      relatedServices: { orderBy: { position: "asc" } },
      revisions: { include: { changedBy: { select: { email: true, name: true } } }, orderBy: { createdAt: "desc" }, take: 12 },
      tags: { include: { tag: true } },
    },
    where: { id },
  });
}

export async function listCmsCategories() {
  return getPrisma().blogCategory.findMany({
    orderBy: { name: "asc" },
  });
}

export async function listNewsletterSubscribers() {
  return getPrisma().newsletterSubscriber.findMany({
    include: { events: { orderBy: { createdAt: "desc" }, take: 3 } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
