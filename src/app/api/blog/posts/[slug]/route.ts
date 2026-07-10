import { NextResponse } from "next/server";

import { cmsErrorResponse } from "@/server/cms/http";
import { getPublicPostBySlug } from "@/server/cms/posts-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    return NextResponse.json(await getPublicPostBySlug(slug));
  } catch (error) {
    return cmsErrorResponse(error);
  }
}
