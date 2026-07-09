import Link from "next/link";
import { redirect } from "next/navigation";

import { PrivacyPolicyInputForm } from "@/components/documents/privacy-policy-input-form";
import { auth } from "@/server/auth";
import { requireDocumentInputActor } from "@/server/documents/input-permissions";
import { getDocumentInputDetail } from "@/server/documents/input-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ClientDocumentInputPage({ params }: { params: Promise<{ inputId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const actor = await requireDocumentInputActor();
  const { inputId } = await params;
  const input = await getDocumentInputDetail(actor, inputId);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link className="text-sm font-semibold text-[var(--brand-ink)]" href="/platforma/dokumenty">
          Wróć do dokumentów
        </Link>
        <p className="mt-4 text-sm font-semibold text-[var(--text-muted)]">Polityka prywatności RODO</p>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">{input.documentName}</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {input.status === "GENERATION_PENDING" ? "Dokument oczekuje na wygenerowanie." : "Uzupełnij dane i zapisz draft albo wyślij finalnie."}
        </p>
      </div>
      <PrivacyPolicyInputForm initialData={(input.data ?? {}) as Record<string, unknown>} inputId={input.id} status={input.status} />
    </main>
  );
}
