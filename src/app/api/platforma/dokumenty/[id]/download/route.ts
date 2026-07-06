import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getPrisma } from "@/server/db/prisma";
import { writePlatformEvent } from "@/server/platform/audit";
import { assertCanDownloadClientDocument, requirePlatformActor } from "@/server/platform/permissions";
import { createPrivateDownloadUrl } from "@/server/storage/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DownloadFormat = "docx" | "pdf" | "zip";

const formats = new Set<DownloadFormat>(["docx", "pdf", "zip"]);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getDownloadActor();
  if (!actor) {
    return NextResponse.json({ error: "Logowanie jest wymagane." }, { status: 401 });
  }

  const { id } = await params;
  const format = normalizeFormat(request.nextUrl.searchParams.get("format"));

  if (!format) {
    return NextResponse.json({ error: "Nieobslugiwany format dokumentu." }, { status: 400 });
  }

  let downloadTarget: Awaited<ReturnType<typeof assertCanDownloadClientDocument>>;
  try {
    downloadTarget = await assertCanDownloadClientDocument(actor, id, format);
  } catch {
    return NextResponse.json({ error: "Nie znaleziono dokumentu." }, { status: 404 });
  }

  const { document, fileKey } = downloadTarget;
  const prisma = getPrisma();

  await prisma.$transaction(async (tx) => {
    const download = await tx.documentDownload.create({
      data: {
        fileType: format,
        generatedDocumentId: document.id,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        organizationId: document.organizationId,
        userAgent: request.headers.get("user-agent"),
        userId: actor.id,
      },
    });

    await writePlatformEvent(
      {
        action: "client.document_downloaded",
        actor,
        body: `${format.toUpperCase()} pobrany z chronionego endpointu.`,
        entityId: document.id,
        entityType: "GeneratedDocument",
        metadata: {
          downloadId: download.id,
          fileType: format,
        },
        organizationId: document.organizationId,
        timelineTitle: `Pobrano dokument ${document.template?.name ?? document.type}`,
        type: "DOCUMENT_DOWNLOADED",
      },
      tx,
    );
  });

  try {
    const signedUrl = await createPrivateDownloadUrl(fileKey, 120);
    return NextResponse.redirect(signedUrl, { status: 302 });
  } catch {
    return NextResponse.json({ error: "Magazyn plikow nie jest skonfigurowany." }, { status: 503 });
  }
}

function normalizeFormat(value: string | null): DownloadFormat | null {
  const format = (value ?? "docx").toLowerCase();
  return formats.has(format as DownloadFormat) ? (format as DownloadFormat) : null;
}

async function getDownloadActor() {
  try {
    return await requirePlatformActor();
  } catch {
    return null;
  }
}
