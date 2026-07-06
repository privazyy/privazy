import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireCrmActor } from "@/server/crm/permissions";
import { listNewsletterSubscribers } from "@/server/cms/data";
import { assertCanReadCms } from "@/server/cms/permissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminNewsletterPage() {
  const actor = await requireCrmActor();
  assertCanReadCms(actor);
  const subscribers = await listNewsletterSubscribers();

  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-[var(--gutter)] py-8 text-[var(--text-strong)]">
      <div className="mx-auto grid w-full max-w-[var(--container-wide)] gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-[var(--brand)]">Newsletter</p>
            <h1 className="mt-2 text-3xl font-bold">Subskrybenci</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Foundation bez masowych kampanii. Wysylka produkcyjna jest poza zakresem.</p>
          </div>
          <Button asChild variant="outline"><Link href="/admin">Wroc do CRM</Link></Button>
        </div>
        <Card padding="md" variant="flat">
          <div className="grid gap-3">
            {subscribers.map((subscriber) => (
              <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-4" key={subscriber.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{subscriber.email}</div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">{subscriber.source ?? "unknown"} - {formatDate(subscriber.createdAt)}</div>
                  </div>
                  <Badge tone={subscriber.status === "ACTIVE" ? "success" : subscriber.status === "UNSUBSCRIBED" ? "neutral" : "warning"}>{subscriber.status}</Badge>
                </div>
              </div>
            ))}
            {subscribers.length === 0 && <div className="py-10 text-center text-sm text-[var(--text-muted)]">Brak subskrybentow newslettera.</div>}
          </div>
        </Card>
      </div>
    </main>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}
