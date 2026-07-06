import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { assertOrganizationAccess, requireDocumentUser } from "@/server/documents/acl";
import { getPrisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PlatformDocumentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireDocumentUser();
  const { id } = await params;
  const document = await getPrisma().generatedDocument.findUnique({
    where: { id },
    include: {
      downloads: {
        include: { user: true },
        orderBy: { downloadedAt: "desc" },
        take: 20,
      },
      files: true,
      generationJob: true,
      orderItem: { include: { order: true } },
      organization: true,
      reviews: { orderBy: { updatedAt: "desc" }, take: 5 },
    },
  });

  if (!document) notFound();
  await assertOrganizationAccess(user, document.organizationId);

  const canSeeDownloads = user.role !== "READ_ONLY";

  return (
    <main className="mx-auto grid w-full max-w-[var(--container-wide)] gap-6 px-4 py-8 sm:px-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 space-y-5">
        <div>
          <Link className="text-sm font-semibold text-[var(--text-link)]" href="/platforma/dokumenty">Wroc do dokumentow</Link>
          <h1 className="mt-3 text-2xl font-bold">{document.orderItem?.productName ?? "Dokument"}</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{document.organization.name}</p>
        </div>

        <Card padding="md" variant="flat">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Status" value={document.status} />
            <Info label="Review" value={document.reviewStatus} />
            <Info label="Typ" value={document.type} />
            <Info label="Wersja szablonu" value={`v${document.templateVersion}`} />
            <Info label="Utworzono" value={document.createdAt.toLocaleString("pl-PL")} />
            <Info label="Zamowienie" value={document.orderItem?.orderId ?? "-"} />
          </div>
        </Card>

        <Card padding="md" variant="flat">
          <h2 className="mb-4 text-lg font-bold">Pliki</h2>
          <div className="grid gap-3">
            {document.files.length ? (
              document.files.map((file) => (
                <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center" key={file.id}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone="brand">{file.type}</Badge>
                      <span className="break-words font-semibold text-[var(--text-strong)]">{file.fileName}</span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Pobieranie przechodzi przez ACL i krotko wazny signed URL.</p>
                  </div>
                  {document.status === "READY" ? (
                    <a className="text-sm font-semibold text-[var(--text-link)]" href={`/api/documents/${document.id}/download/${file.id}`}>
                      Pobierz
                    </a>
                  ) : (
                    <span className="text-sm text-[var(--text-muted)]">Niedostepne</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Brak plikow dla dokumentu.</p>
            )}
          </div>
        </Card>

        {document.generationJob?.safeErrorMessage ? (
          <Card padding="md" variant="flat">
            <h2 className="text-lg font-bold">Komunikat bledu</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{document.generationJob.safeErrorMessage}</p>
          </Card>
        ) : null}
      </section>

      <aside className="min-w-0 space-y-5">
        <Card padding="md" variant="flat">
          <h2 className="text-lg font-bold">Historia pobran</h2>
          {canSeeDownloads ? (
            <div className="mt-4 grid gap-3">
              {document.downloads.length ? (
                document.downloads.map((download) => (
                  <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3 text-sm" key={download.id}>
                    <div className="font-semibold text-[var(--text-strong)]">{download.user.name ?? download.user.email}</div>
                    <div className="text-[var(--text-muted)]">{download.downloadedAt.toLocaleString("pl-PL")}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text-muted)]">Brak pobran.</p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--text-muted)]">Historia pobran nie jest dostepna dla roli READ_ONLY.</p>
          )}
        </Card>
      </aside>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{label}</div>
      <div className="mt-2 break-words font-semibold text-[var(--text-strong)]">{value}</div>
    </div>
  );
}
