import { NextResponse } from "next/server";

import { newsletterErrorResponse, parseJson } from "@/server/newsletter/http";
import { getRequestMeta, unsubscribeNewsletter } from "@/server/newsletter/newsletter-service";
import { newsletterUnsubscribeSchema } from "@/server/newsletter/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = newsletterUnsubscribeSchema.parse(await parseJson(request));
    return NextResponse.json(await unsubscribeNewsletter(input, getRequestMeta(request)));
  } catch (error) {
    return newsletterErrorResponse(error);
  }
}
