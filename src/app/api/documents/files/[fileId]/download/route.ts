import { NextResponse } from "next/server";

import { auth } from "@/server/auth";
import { getPrisma } from "@/server/db/prisma";
import {
  assertCanDownloadDocumentFile,
  DocumentDownloadError,
  resolveDownloadContext,
} from "@/server/documents/download-permissions";
import { getRequestAuditMetadata } from "@/server/security/request-metadata";
import { createPrivateDownloadUrl, getPrivateDownloadUrlTtlSeconds } from "@/server/storage/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    fileId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  return createDownloadResponse(request, context);
}

export async function GET(request: Request, context: RouteContext) {
  return createDownloadResponse(request, context);
}

async function createDownloadResponse(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const { fileId } = await context.params;
    const user = {
      id: session?.user?.id,
      role: session?.user?.role,
    };
    const downloadContext = await resolveDownloadContext(fileId, user);
    assertCanDownloadDocumentFile(user, downloadContext);

    const ttlSeconds = getPrivateDownloadUrlTtlSeconds();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const url = await createPrivateDownloadUrl(downloadContext.fileKey, ttlSeconds);
    const auditMetadata = getRequestAuditMetadata(request);

    await getPrisma().documentDownload.create({
      data: {
        actorRole: downloadContext.actor.role,
        downloadedAt: new Date(),
        fileId: downloadContext.fileId,
        generatedDocumentId: downloadContext.document.id,
        ipHash: auditMetadata.ipHash,
        organizationId: downloadContext.document.organizationId,
        source: downloadContext.source,
        userAgentHash: auditMetadata.userAgentHash,
        userId: downloadContext.actor.id,
      },
    });

    return NextResponse.json({
      expiresAt: expiresAt.toISOString(),
      file: downloadContext.file,
      ok: true,
      url,
    });
  } catch (error) {
    if (error instanceof DocumentDownloadError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: statusForDownloadError(error) },
      );
    }

    console.error("Document download failed", redactError(error));
    return NextResponse.json(
      {
        error: {
          code: "internal_error",
          message: "Nie udało się przygotować pobrania dokumentu.",
        },
      },
      { status: 500 },
    );
  }
}

function statusForDownloadError(error: DocumentDownloadError) {
  if (error.code === "unauthorized") return 401;
  if (error.code === "forbidden") return 403;
  if (error.code === "conflict") return 409;
  return 404;
}

function redactError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message
    .replace(/generated-documents\/[^\s"']+/g, "[REDACTED_STORAGE_KEY]")
    .replace(/templates\/[^\s"']+/g, "[REDACTED_STORAGE_KEY]")
    .replace(/https:\/\/[^\s"']+/g, "[REDACTED_URL]");
}
