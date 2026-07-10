import { NextResponse } from "next/server";

import { requireCmsRead, requireCmsWrite } from "@/server/cms/cms-permissions";
import { cmsErrorResponse, parseJson } from "@/server/cms/http";
import { cmsTagCreateSchema } from "@/server/cms/schemas";
import { createTag, listTags } from "@/server/cms/tags-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await requireCmsRead();
    return NextResponse.json({ items: await listTags() });
  } catch (error) {
    return cmsErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireCmsWrite("create");
    const input = cmsTagCreateSchema.parse(await parseJson(request));
    return NextResponse.json(await createTag(input, actor), { status: 201 });
  } catch (error) {
    return cmsErrorResponse(error);
  }
}
