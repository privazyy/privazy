import { NextResponse } from "next/server";
import { inngest } from "@/server/inngest/client";
import { requireDocumentGenerationAccess, safeDocumentGenerationError } from "@/server/documents/guards";
import { requestDocumentGeneration } from "@/server/documents/service";
import { documentGenerateApiSchema } from "@/server/documents/schemas";

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload.", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  const parsed = documentGenerateApiSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid document generation payload.", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const context = await requireDocumentGenerationAccess(parsed.data);
    const job = await requestDocumentGeneration(context);

    await inngest.send({
      name: "document/generate.requested",
      data: {
        jobId: job.id,
      },
      id: context.idempotencyKey,
    });

    return NextResponse.json({ jobId: job.id, status: job.status }, { status: 202 });
  } catch (error) {
    const response = safeDocumentGenerationError(error);

    return NextResponse.json(response.body, { status: response.status });
  }
}
