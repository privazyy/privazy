import { NextResponse } from "next/server";
import { authErrorResponse, requireApiRole } from "@/server/auth/api";
import { ForbiddenError, assertCanAccessOrganization, logBlockedAccessAttempt } from "@/server/auth/guards";
import { DOCUMENT_GENERATION_ROLES } from "@/server/auth/roles";
import { requestDocumentGeneration } from "@/server/documents/service";
import { documentGenerateApiSchema } from "@/server/documents/schemas";
import { inngest } from "@/server/inngest/client";
import { safeLogAuditEvent } from "@/server/audit/log";

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = documentGenerateApiSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid document generation payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const user = await requireApiRole(DOCUMENT_GENERATION_ROLES, {
      entityId: parsed.data.organizationId,
      entityType: "DocumentGenerationJob",
      request,
    });

    try {
      await assertCanAccessOrganization(user, parsed.data.organizationId);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        await logBlockedAccessAttempt({
          entityId: parsed.data.organizationId,
          entityType: "Organization",
          metadata: {
            path: new URL(request.url).pathname,
            reason: "organization_access_denied",
          },
          organizationId: parsed.data.organizationId,
          request,
          user,
        });
      }

      throw error;
    }

    const job = await requestDocumentGeneration({
      ...parsed.data,
      createdById: user.id,
    });

    await safeLogAuditEvent({
      action: "document.generation_requested",
      entityId: job.id,
      entityType: "DocumentGenerationJob",
      metadata: {
        templateId: job.templateId,
      },
      organizationId: job.organizationId,
      request,
      userId: user.id,
    });

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
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error("Document generation request failed", error);
    return NextResponse.json({ error: "Document generation request failed" }, { status: 500 });
  }
}
