import { NextResponse } from "next/server";

import { safeJsonError } from "@/server/api/errors";
import { auth } from "@/server/auth";
import { resolveDocumentGenerationContext } from "@/server/documents/security";
import { requestDocumentGeneration } from "@/server/documents/service";
import { inngest } from "@/server/inngest/client";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const context = resolveDocumentGenerationContext(await auth(), json);
    const job = await requestDocumentGeneration(context.input);

    await inngest.send({
      data: {
        jobId: job.id,
      },
      id: readIdempotencyKey(json),
      name: "document/generate.requested",
    });

    return NextResponse.json({ jobId: job.id, status: job.status }, { status: 202 });
  } catch (error) {
    return safeJsonError(error);
  }
}

function readIdempotencyKey(value: unknown) {
  if (!value || typeof value !== "object" || !("idempotencyKey" in value)) return undefined;
  const idempotencyKey = value.idempotencyKey;
  return typeof idempotencyKey === "string" ? idempotencyKey : undefined;
}
