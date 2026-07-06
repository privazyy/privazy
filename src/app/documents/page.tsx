import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function DocumentsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Card padding="lg" variant="flat">
        <h1 className="text-2xl font-semibold">Generowanie dokumentow</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Bezpieczny flow dokumentow po zakupie jest dostepny w portalu klienta. Stary endpoint generowania zostal wylaczony,
          bo nie moze przyjmowac organizationId, templateId ani createdById bez weryfikacji sesji.
        </p>
        <Link className="mt-5 inline-flex text-sm font-semibold text-[var(--text-link)]" href="/platforma/dokumenty">
          Przejdz do dokumentow
        </Link>
      </Card>
    </main>
  );
}
