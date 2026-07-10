import { NextResponse } from "next/server";

import { cmsErrorResponse, queryObject } from "@/server/cms/http";
import { publicPostListQuerySchema } from "@/server/cms/schemas";
import { listPublicPosts } from "@/server/cms/posts-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const query = publicPostListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listPublicPosts(query));
  } catch (error) {
    return cmsErrorResponse(error);
  }
}
