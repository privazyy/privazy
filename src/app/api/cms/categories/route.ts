import { NextResponse } from "next/server";

import { requireCmsRead, requireCmsWrite } from "@/server/cms/cms-permissions";
import { cmsErrorResponse, parseJson } from "@/server/cms/http";
import { cmsCategoryCreateSchema } from "@/server/cms/schemas";
import { createCategory, listCategories } from "@/server/cms/categories-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await requireCmsRead();
    return NextResponse.json({ items: await listCategories() });
  } catch (error) {
    return cmsErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireCmsWrite("create");
    const input = cmsCategoryCreateSchema.parse(await parseJson(request));
    return NextResponse.json(await createCategory(input, actor), { status: 201 });
  } catch (error) {
    return cmsErrorResponse(error);
  }
}
