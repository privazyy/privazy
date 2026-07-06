import { NextResponse } from "next/server";
import { buildIdempotencyKey } from "@/server/automations/idempotency";
import { requestDocumentGeneration } from "@/server/documents/service";
import { documentGenerateApiSchema } from "@/server/documents/schemas";
import { emitEvent } from "@/server/events/emit-event";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = documentGenerateApiSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid document generation payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const job = await requestDocumentGeneration(parsed.data);

  await emitEvent({
    critical: true,
    eventType: "document.generate.requested.v1",
    idempotencyKey: parsed.data.idempotencyKey ?? buildIdempotencyKey(["document-generate", job.id]),
    organizationId: job.organizationId,
    payload: {
      jobId: job.id,
      organizationId: job.organizationId,
      resourceId: job.id,
      templateId: job.templateId,
    },
    source: "document-api",
  });

  return NextResponse.json({ jobId: job.id, status: job.status }, { status: 202 });
}
