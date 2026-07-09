import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { requireDocumentInputActor } from "@/server/documents/input-permissions";
import { listClientDocumentWorkItems } from "@/server/documents/input-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ClientDocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const actor = await requireDocumentInputActor();
  const data = await listClientDocumentWorkItems(actor);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text-muted)]">Platforma klienta</p>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Dokumenty do uzupełnienia</h1>
        </div>
      </div>

      <section className="grid gap-4">
        {data.availableOrderItems.map((item) => (
          <form action="/api/documents/inputs/from-order-item" className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4" key={item.id} method="post">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-[var(--text-strong)]">{item.name}</h2>
                <p className="text-sm text-[var(--text-muted)]">Zamówienie {item.order.orderNumber} · {item.template?.name ?? item.documentType}</p>
              </div>
              <CreateInputButton orderItemId={item.id} />
            </div>
          </form>
        ))}

        {data.inputs.items.map((input) => (
          <article className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4" key={input.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-[var(--text-strong)]">{input.documentName}</h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {input.order?.orderNumber ?? "Bez numeru zamówienia"} · {input.template.name} v{input.template.version}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 py-1 text-sm font-semibold">{input.status}</span>
                <Link className="rounded-[var(--radius-sm)] bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white" href={`/platforma/dokumenty/${input.id}`}>
                  {input.status === "DRAFT" || input.status === "NEEDS_CORRECTION" ? "Kontynuuj draft" : "Zobacz status"}
                </Link>
              </div>
            </div>
          </article>
        ))}

        {data.availableOrderItems.length === 0 && data.inputs.items.length === 0 && (
          <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-sm text-[var(--text-muted)]">
            Brak dokumentów do uzupełnienia dla Twojej organizacji.
          </div>
        )}
      </section>
    </main>
  );
}

function CreateInputButton({ orderItemId }: { orderItemId: string }) {
  return (
    <button
      className="rounded-[var(--radius-sm)] bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white"
      formAction={async () => {
        "use server";
        const actor = await requireDocumentInputActor();
        const { createDocumentInputForOrderItem } = await import("@/server/documents/input-service");
        const created = await createDocumentInputForOrderItem(orderItemId, actor);
        redirect(`/platforma/dokumenty/${created.id}`);
      }}
      type="submit"
    >
      Uzupełnij
    </button>
  );
}
