import Link from "next/link";
import { notFound } from "next/navigation";
import { PrivacyPolicyForm } from "@/components/documents/privacy-policy-form";
import { Card } from "@/components/ui/card";
import { getAccessibleOrderItem, requireDocumentUser } from "@/server/documents/acl";
import type { PrivacyPolicyFormData } from "@/lib/document-forms/privacy-policy/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PrivacyPolicyFormPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireDocumentUser();
  const { id } = await params;
  const orderItem = await getAccessibleOrderItem(id, user);

  if (orderItem.kind !== "DOCUMENT" || orderItem.documentType !== "PRIVACY_POLICY") {
    notFound();
  }

  const latestInput = await import("@/server/db/prisma").then(({ getPrisma }) =>
    getPrisma().documentInput.findFirst({
      where: { orderItemId: orderItem.id },
      orderBy: { updatedAt: "desc" },
    }),
  );

  return (
    <main className="mx-auto w-full max-w-[var(--container-wide)] px-4 py-8 sm:px-6">
      <div className="mb-5">
        <Link className="text-sm font-semibold text-[var(--text-link)]" href="/platforma/dokumenty">Wroc do dokumentow</Link>
      </div>
      {orderItem.order.status !== "PAID" && orderItem.order.status !== "MANUALLY_APPROVED" && user.role === "CLIENT" ? (
        <Card padding="lg" variant="flat">
          <h1 className="text-2xl font-bold">Dokument bedzie dostepny po oplaceniu zamowienia</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Formularz mozna uzupelnic po potwierdzeniu platnosci albo recznym zatwierdzeniu przez zespol PRIVAZY.</p>
        </Card>
      ) : (
        <PrivacyPolicyForm
          initialData={(latestInput?.data ?? null) as Partial<PrivacyPolicyFormData> | null}
          orderItemId={orderItem.id}
        />
      )}
    </main>
  );
}
