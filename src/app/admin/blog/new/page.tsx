import { CmsPostForm } from "@/app/admin/blog/post-form";
import { requireCrmActor } from "@/server/crm/permissions";
import { assertCanEditCmsDraft } from "@/server/cms/permissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function NewBlogPostPage() {
  const actor = await requireCrmActor();
  assertCanEditCmsDraft(actor);

  return <CmsPostForm actorRole={actor.role} />;
}
