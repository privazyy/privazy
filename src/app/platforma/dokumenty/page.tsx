import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireDocumentUser } from "@/server/documents/acl";
import { getPrisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PlatformDocumentsPage() {
  const user = await requireDocumentUser();
  const organizationIds =
    user.role === "CLIENT" || user.role === "READ_ONLY"
      ? user.clientProfiles.map((profile) => profile.organizationId)
      : undefined;

  const [documents, orderItems] = await Promise.all([
    getPrisma().generatedDocument.findMany({
      where: organizationIds ? { organizationId: { in: organizationIds } } : undefined,
      include: {
        files: true,
        organization: true,
        orderItem: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    getPrisma().orderItem.findMany({
      where: {
        organizationId: organizationIds ? { in: organizationIds } : undefined,
        kind: "DOCUMENT",
        documentType: "PRIVACY_POLICY",
      },
      include: {
        documentInputs: { orderBy: { updatedAt: "desc" }, take: 1 },
        generatedDocuments: { orderBy: { createdAt: "desc" }, take: 1 },
        order: true,
        organization: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
  ]);

  const awaitingInput = orderItems.filter((item) => item.status === "INPUT_REQUIRED" || item.status === "DRAFT");
  const generating = orderItems.filter((item) => item.status === "GENERATING" || item.status === "SUBMITTED");
  const failed = orderItems.filter((item) => item.status === "FAILED");

  return (
    <main className="mx-auto grid w-full max-w-[var(--container-wide)] gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold">Dokumenty</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Bezpieczny flow formularza, generowania i pobierania dokumentow.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Wymagaja danych" value={awaitingInput.length} />
        <Kpi label="W generowaniu" value={generating.length} />
        <Kpi label="Gotowe" value={documents.filter((document) => document.status === "READY").length} />
        <Kpi label="Bledy" value={failed.length} />
      </div>

      <Card padding="md" variant="flat">
        <h2 className="mb-4 text-lg font-bold">Do uzupelnienia</h2>
        <div className="grid gap-3">
          {awaitingInput.length ? (
            awaitingInput.map((item) => (
              <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center" key={item.id}>
                <div className="min-w-0">
                  <div className="font-semibold text-[var(--text-strong)]">{item.productName}</div>
                  <div className="text-sm text-[var(--text-muted)]">{item.organization.name}</div>
                </div>
                <Link className="text-sm font-semibold text-[var(--text-link)]" href={`/platforma/dokumenty/${item.id}/formularz`}>
                  Otworz formularz
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Brak dokumentow wymagajacych danych.</p>
          )}
        </div>
      </Card>

      <Card padding="md" variant="flat">
        <h2 className="mb-4 text-lg font-bold">Wygenerowane dokumenty</h2>
        <div className="grid gap-3">
          {documents.length ? (
            documents.map((document) => (
              <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center" key={document.id}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-[var(--text-strong)]">{document.orderItem?.productName ?? document.type}</div>
                    <Badge tone={document.status === "READY" ? "success" : document.status === "FAILED" ? "danger" : "warning"}>{document.status}</Badge>
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">{document.organization.name} - pliki: {document.files.length}</div>
                </div>
                <Link className="text-sm font-semibold text-[var(--text-link)]" href={`/platforma/dokumenty/${document.id}`}>
                  Szczegoly
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Brak wygenerowanych dokumentow.</p>
          )}
        </div>
      </Card>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <Card padding="md" variant="flat">
      <div className="text-2xl font-bold text-[var(--text-strong)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--text-muted)]">{label}</div>
    </Card>
  );
}
