import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminCmsPanel } from "@/components/cms/admin-cms-panel";
import { auth } from "@/server/auth";
import { canMutateCms, canPublishCms } from "@/server/cms/cms-permissions";
import { listCategories } from "@/server/cms/categories-service";
import { listCmsPosts } from "@/server/cms/posts-service";
import { listTags } from "@/server/cms/tags-service";
import { listSubscribersForAdmin } from "@/server/newsletter/newsletter-service";

export const metadata: Metadata = {
  title: "privazy. CMS",
  description: "Panel CMS bloga i newslettera PRIVAZY.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminCmsPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id || !role) redirect("/");
  if (role === "CLIENT") redirect("/client");

  const [posts, categories, tags, subscribers] = await Promise.all([
    listCmsPosts({ limit: 50 }),
    listCategories(),
    listTags(),
    listSubscribersForAdmin({ limit: 25 }),
  ]);

  return (
    <AdminCmsPanel
      canMutate={canMutateCms(role)}
      canPublish={canPublishCms(role)}
      initialCategories={toClientData(categories)}
      initialPosts={toClientData(posts.items)}
      initialSubscribers={toClientData(subscribers.items)}
      initialTags={toClientData(tags)}
      role={role}
    />
  );
}

function toClientData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
