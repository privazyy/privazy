import { NextResponse } from "next/server";

import { newsletterErrorResponse, parseJson } from "@/server/newsletter/http";
import { getRequestMeta, subscribeNewsletter } from "@/server/newsletter/newsletter-service";
import { newsletterSubscribeSchema } from "@/server/newsletter/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = newsletterSubscribeSchema.parse(await parseJson(request));
    return NextResponse.json(await subscribeNewsletter(input, getRequestMeta(request)));
  } catch (error) {
    return newsletterErrorResponse(error);
  }
}
