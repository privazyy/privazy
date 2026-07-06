import { notFound } from "next/navigation";

import { CmsPostForm } from "@/app/admin/blog/post-form";
import { requireCrmActor } from "@/server/crm/permissions";
import { getCmsPost } from "@/server/cms/data";
import { assertCanEditCmsDraft } from "@/server/cms/permissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireCrmActor();
  assertCanEditCmsDraft(actor);
  const { id } = await params;
  const post = await getCmsPost(id);
  if (!post) notFound();

  return <CmsPostForm actorRole={actor.role} post={post} />;
}
