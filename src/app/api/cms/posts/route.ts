import { NextResponse } from "next/server";

import { requireCmsRead, requireCmsWrite } from "@/server/cms/cms-permissions";
import { cmsErrorResponse, parseJson, queryObject } from "@/server/cms/http";
import { cmsPostCreateSchema, cmsPostListQuerySchema } from "@/server/cms/schemas";
import { createPost, listCmsPosts } from "@/server/cms/posts-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireCmsRead();
    const query = cmsPostListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listCmsPosts(query));
  } catch (error) {
    return cmsErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireCmsWrite("create");
    const input = cmsPostCreateSchema.parse(await parseJson(request));
    return NextResponse.json(await createPost(input, actor), { status: 201 });
  } catch (error) {
    return cmsErrorResponse(error);
  }
}
