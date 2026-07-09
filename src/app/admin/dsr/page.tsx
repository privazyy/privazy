import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { DsrEmpty, DsrPageHeader, DsrStatusBadge, dsrTypeLabels, formatDate } from "@/components/dsr/dsr-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireDsrCrmRead } from "@/server/dsr/access";
import { listCrmDsrRequests } from "@/server/dsr/service";

export const metadata: Metadata = {
  title: "DSR - CRM privazy.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CrmDsrPage() {
  await requireDsrCrmRead();
  const data = await listCrmDsrRequests({ limit: 100 });

  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-4 py-6 text-[var(--text-body)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[var(--container-wide)] space-y-5">
        <DsrPageHeader eyebrow="CRM" title="Wnioski osob" />
        {data.items.length === 0 ? (
          <DsrEmpty text="Brak wnioskow DSR w bazie." />
        ) : (
          <Card padding="md" variant="flat">
            <div className="pvz-h-scroll" data-responsive-scroll="true">
              <table className="min-w-[960px] w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
                    {["Wniosek", "Organizacja", "Typ", "Status", "Priorytet", "Termin", "Opiekun", ""].map((column) => (
                      <th className="px-4 py-3 text-xs font-bold uppercase text-[var(--text-muted)]" key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr className="border-b border-[var(--border-subtle)] last:border-b-0" key={item.id}>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[var(--text-strong)]">{item.requesterName}</div>
                        <div className="text-xs text-[var(--text-muted)]">{item.requesterEmail}</div>
                      </td>
                      <td className="px-4 py-4">{item.organization.name}</td>
                      <td className="px-4 py-4">{dsrTypeLabels[item.type] ?? item.type}</td>
                      <td className="px-4 py-4"><DsrStatusBadge status={item.status} /></td>
                      <td className="px-4 py-4">{item.priority}</td>
                      <td className="px-4 py-4">{formatDate(item.dueAt)}</td>
                      <td className="px-4 py-4">{item.assignedTo?.name ?? item.assignedTo?.email ?? "-"}</td>
                      <td className="px-4 py-4 text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/dsr/${item.id}` as Route}>Otworz</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
