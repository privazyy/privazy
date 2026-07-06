import { NextResponse } from "next/server";
import { DocumentAccessError, assertOrganizationAccess, auditDocumentEvent, canReadDocumentDownloads, requireDocumentUser, toSafeClientError } from "@/server/documents/acl";
import { getPrisma } from "@/server/db/prisma";
import { createPrivateDownloadUrl } from "@/server/storage/r2";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ documentId: string; fileId: string }> },
) {
  try {
    const user = await requireDocumentUser();

    if (!canReadDocumentDownloads(user.role)) {
      throw new DocumentAccessError("Document not found.", 404);
    }

    const { documentId, fileId } = await params;
    const file = await getPrisma().generatedDocumentFile.findFirst({
      where: {
        id: fileId,
        generatedDocumentId: documentId,
      },
      include: {
        generatedDocument: true,
      },
    });

    if (!file || file.generatedDocument.status !== "READY") {
      throw new DocumentAccessError("Document not found.", 404);
    }

    await assertOrganizationAccess(user, file.organizationId);

    await getPrisma().documentDownload.create({
      data: {
        userId: user.id,
        organizationId: file.organizationId,
        generatedDocumentId: file.generatedDocumentId,
        fileId: file.id,
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
        userAgent: request.headers.get("user-agent") ?? undefined,
      },
    });

    await auditDocumentEvent({
      userId: user.id,
      organizationId: file.organizationId,
      action: "document.download_requested",
      entityType: "GeneratedDocumentFile",
      entityId: file.id,
      metadata: { generatedDocumentId: file.generatedDocumentId, fileType: file.type },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    const signedUrl = await createPrivateDownloadUrl(file.fileKey, 180);

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    const safe = toSafeClientError(error);
    return NextResponse.json({ error: safe.message }, { status: safe.status });
  }
}
