import { NextResponse } from "next/server";

import { requireCmsRead } from "@/server/cms/cms-permissions";
import { cmsErrorResponse, queryObject } from "@/server/cms/http";
import { listSubscribersForAdmin } from "@/server/newsletter/newsletter-service";
import { newsletterSubscriberListQuerySchema } from "@/server/newsletter/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireCmsRead();
    const query = newsletterSubscriberListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listSubscribersForAdmin(query));
  } catch (error) {
    return cmsErrorResponse(error);
  }
}
