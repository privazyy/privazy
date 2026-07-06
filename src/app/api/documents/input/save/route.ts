import { NextResponse } from "next/server";
import { documentInputApiSchema } from "@/server/documents/schemas";
import { savePrivacyPolicyDraft } from "@/server/documents/service";
import { toSafeClientError } from "@/server/documents/acl";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = documentInputApiSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid document input payload.", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await savePrivacyPolicyDraft({
      orderItemId: parsed.data.orderItemId,
      data: parsed.data.data,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    if (!result.ok) {
      return NextResponse.json({ error: "Invalid draft data.", details: result.error }, { status: 400 });
    }

    return NextResponse.json({
      documentInputId: result.documentInput.id,
      status: result.documentInput.status,
      version: result.documentInput.version,
    });
  } catch (error) {
    const safe = toSafeClientError(error);
    return NextResponse.json({ error: safe.message }, { status: safe.status });
  }
}
