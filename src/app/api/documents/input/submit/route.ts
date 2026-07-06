import { NextResponse } from "next/server";
import { inngest } from "@/server/inngest/client";
import { toSafeClientError } from "@/server/documents/acl";
import { documentInputApiSchema } from "@/server/documents/schemas";
import { submitPrivacyPolicyInput } from "@/server/documents/service";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = documentInputApiSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid document input payload.", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await submitPrivacyPolicyInput({
      orderItemId: parsed.data.orderItemId,
      data: parsed.data.data,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    if (!result.ok) {
      return NextResponse.json({ error: "Invalid privacy policy data.", details: result.error }, { status: 400 });
    }

    await inngest.send({
      name: "document/generate.requested",
      data: {
        jobId: result.job.id,
        documentInputId: result.documentInput.id,
        orderItemId: result.job.orderItemId,
      },
      id: `document-input-${result.documentInput.id}-v${result.documentInput.version}`,
    });

    return NextResponse.json(
      {
        documentInputId: result.documentInput.id,
        jobId: result.job.id,
        status: result.documentInput.status,
      },
      { status: 202 },
    );
  } catch (error) {
    const safe = toSafeClientError(error);
    return NextResponse.json({ error: safe.message }, { status: safe.status });
  }
}
