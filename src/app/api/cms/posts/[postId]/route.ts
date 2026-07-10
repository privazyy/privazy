import { NextResponse } from "next/server";

import { requireCmsRead, requireCmsWrite } from "@/server/cms/cms-permissions";
import { cmsErrorResponse, parseJson } from "@/server/cms/http";
import { cmsPostUpdateSchema } from "@/server/cms/schemas";
import { getCmsPost, updatePost } from "@/server/cms/posts-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ postId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireCmsRead();
    const { postId } = await context.params;
    return NextResponse.json(await getCmsPost(postId));
  } catch (error) {
    return cmsErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireCmsWrite("update");
    const { postId } = await context.params;
    const input = cmsPostUpdateSchema.parse(await parseJson(request));
    return NextResponse.json(await updatePost(postId, input, actor));
  } catch (error) {
    return cmsErrorResponse(error);
  }
}
