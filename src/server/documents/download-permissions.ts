import "server-only";

import type { GeneratedDocumentStatus, UserRole } from "@prisma/client";

import { getPrisma } from "@/server/db/prisma";
import {
  getDocumentFileKey,
  parseDocumentFileId,
  serializeDownloadableFileForClient,
  serializeDownloadableFileForCrm,
  type DocumentFileVariant,
  type DownloadableFile,
} from "@/server/documents/serializers";

export type DownloadActor = {
  id?: string;
  role?: UserRole | null;
};

export type DocumentDownloadContext = {
  actor: {
    id: string;
    organizationIds: string[];
    role: UserRole;
  };
  document: NonNullable<Awaited<ReturnType<typeof findDocumentForDownload>>>;
  file: DownloadableFile;
  fileId: string;
  fileKey: string;
  source: "API" | "CLIENT_PORTAL" | "CRM";
  variant: DocumentFileVariant;
};

const STAFF_DOWNLOAD_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"]);
const CLIENT_DOWNLOAD_STATUSES = new Set<GeneratedDocumentStatus>(["DELIVERED", "GENERATED"]);
const STAFF_DOWNLOAD_STATUSES = new Set<GeneratedDocumentStatus>(["ARCHIVED", "DELIVERED", "GENERATED"]);

export class DocumentDownloadError extends Error {
  constructor(
    public readonly code: "conflict" | "forbidden" | "not_found" | "unauthorized",
    message: string,
  ) {
    super(message);
  }
}

export async function resolveDownloadContext(fileId: string, user: DownloadActor): Promise<DocumentDownloadContext> {
  if (!user.id) {
    throw new DocumentDownloadError("unauthorized", "Wymagane logowanie.");
  }

  const parsed = parseDocumentFileId(fileId);
  if (!parsed) {
    throw new DocumentDownloadError("not_found", "Nie znaleziono pliku.");
  }

  const [actor, document] = await Promise.all([
    getPrisma().user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        role: true,
        clientProfiles: {
          select: {
            organizationId: true,
          },
        },
      },
    }),
    findDocumentForDownload(parsed.documentId),
  ]);

  if (!actor) {
    throw new DocumentDownloadError("unauthorized", "Wymagane logowanie.");
  }

  if (!document) {
    throw new DocumentDownloadError("not_found", "Nie znaleziono pliku.");
  }

  const fileKey = getDocumentFileKey(document, parsed.variant);
  const file =
    actor.role === "CLIENT"
      ? serializeDownloadableFileForClient(document, parsed.variant)
      : serializeDownloadableFileForCrm(document, parsed.variant);

  if (!fileKey || !file) {
    throw new DocumentDownloadError("not_found", "Nie znaleziono pliku.");
  }

  return {
    actor: {
      id: actor.id,
      organizationIds: actor.clientProfiles.map((profile) => profile.organizationId),
      role: actor.role,
    },
    document,
    file,
    fileId,
    fileKey,
    source: sourceForRole(actor.role),
    variant: parsed.variant,
  };
}

export function canDownloadDocumentFile(user: DownloadActor, context: DocumentDownloadContext) {
  if (!user.id || user.id !== context.actor.id) return false;

  if (context.actor.role === "CLIENT") {
    return (
      CLIENT_DOWNLOAD_STATUSES.has(context.document.status) &&
      context.actor.organizationIds.includes(context.document.organizationId)
    );
  }

  return STAFF_DOWNLOAD_ROLES.has(context.actor.role) && STAFF_DOWNLOAD_STATUSES.has(context.document.status);
}

export function assertCanDownloadDocumentFile(user: DownloadActor, context: DocumentDownloadContext) {
  if (!user.id || user.id !== context.actor.id) {
    throw new DocumentDownloadError("unauthorized", "Wymagane logowanie.");
  }

  if (context.actor.role === "CLIENT") {
    // Check tenant ownership before readiness so a client cannot use status
    // differences to confirm that another organization's document exists.
    if (!context.actor.organizationIds.includes(context.document.organizationId)) {
      throw new DocumentDownloadError("not_found", "Nie znaleziono pliku.");
    }

    if (!CLIENT_DOWNLOAD_STATUSES.has(context.document.status)) {
      throw new DocumentDownloadError("conflict", "Plik nie jest gotowy do pobrania.");
    }

    return;
  }

  if (!STAFF_DOWNLOAD_ROLES.has(context.actor.role)) {
    throw new DocumentDownloadError("not_found", "Nie znaleziono pliku.");
  }

  if (!STAFF_DOWNLOAD_STATUSES.has(context.document.status)) {
    throw new DocumentDownloadError("conflict", "Plik nie jest gotowy do pobrania.");
  }
}

async function findDocumentForDownload(documentId: string) {
  return getPrisma().generatedDocument.findUnique({
    where: { id: documentId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      template: {
        select: {
          name: true,
        },
      },
    },
  });
}

function sourceForRole(role: UserRole): DocumentDownloadContext["source"] {
  if (role === "CLIENT") return "CLIENT_PORTAL";
  if (STAFF_DOWNLOAD_ROLES.has(role)) return "CRM";
  return "API";
}
