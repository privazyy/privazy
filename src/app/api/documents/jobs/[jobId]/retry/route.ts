import { NextResponse } from "next/server";
import { inngest } from "@/server/inngest/client";
import { toSafeClientError } from "@/server/documents/acl";
import { retryDocumentGeneration } from "@/server/documents/service";

export async function POST(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
    const job = await retryDocumentGeneration(jobId);

    await inngest.send({
      name: "document/generate.requested",
      data: {
        jobId: job.id,
        documentInputId: job.documentInputId,
        orderItemId: job.orderItemId,
      },
      id: `document-job-${job.id}-retry-${job.attempt + 1}`,
    });

    return NextResponse.json({ jobId: job.id, status: "PENDING" }, { status: 202 });
  } catch (error) {
    const safe = toSafeClientError(error);
    return NextResponse.json({ error: safe.message }, { status: safe.status });
  }
}
