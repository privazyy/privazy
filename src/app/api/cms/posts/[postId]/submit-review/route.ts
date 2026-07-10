import { NextResponse } from "next/server";

import { requireCmsWrite } from "@/server/cms/cms-permissions";
import { cmsErrorResponse } from "@/server/cms/http";
import { submitPostForReview } from "@/server/cms/posts-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ postId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const actor = await requireCmsWrite("submitReview");
    const { postId } = await context.params;
    return NextResponse.json(await submitPostForReview(postId, actor));
  } catch (error) {
    return cmsErrorResponse(error);
  }
}
