import { NextResponse } from "next/server";
import { inngest } from "@/server/inngest/client";
import { requestDocumentGeneration } from "@/server/documents/service";
import { documentGenerateApiSchema } from "@/server/documents/schemas";

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

  await inngest.send({
    name: "document/generate.requested",
    data: {
      jobId: job.id,
      organizationId: job.organizationId,
      templateId: job.templateId,
    },
    id: parsed.data.idempotencyKey,
  });

  return NextResponse.json({ jobId: job.id, status: job.status }, { status: 202 });
}
