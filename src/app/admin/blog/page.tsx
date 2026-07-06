import Link from "next/link";
import type { Route } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireCrmActor } from "@/server/crm/permissions";
import { listCmsPosts } from "@/server/cms/data";
import { canEditCmsDraft } from "@/server/cms/permissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminBlogPage() {
  const actor = await requireCrmActor();
  const posts = await listCmsPosts();

  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-[var(--gutter)] py-8 text-[var(--text-strong)]">
      <div className="mx-auto grid w-full max-w-[var(--container-wide)] gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-[var(--brand)]">CMS</p>
            <h1 className="mt-2 text-3xl font-bold">Blog i baza wiedzy</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
              Wpisy z workflow draft, review, scheduled, published i archived. READ_ONLY ma tylko podglad.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link href="/admin">Wroc do CRM</Link></Button>
            {canEditCmsDraft(actor) && <Button asChild><Link href={"/admin/blog/new" as Route}>Nowy wpis</Link></Button>}
          </div>
        </div>

        <Card padding="md" variant="flat">
          <div className="pvz-h-scroll" data-responsive-scroll="true">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  {["Tytul", "Status", "Kategoria", "Autor", "Review", "Rewizje", "Aktualizacja", ""].map((column) => (
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-normal text-[var(--text-muted)]" key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr className="border-b border-[var(--border-subtle)] last:border-b-0" key={post.id}>
                    <td className="px-3 py-4">
                      <div className="font-semibold text-[var(--text-strong)]">{post.title}</div>
                      <div className="mt-1 text-xs text-[var(--text-muted)]">/{post.slug}</div>
                    </td>
                    <td className="px-3 py-4"><Badge tone={toneForStatus(post.status)}>{post.status}</Badge></td>
                    <td className="px-3 py-4">{post.category.name}</td>
                    <td className="px-3 py-4">{post.author?.name ?? post.author?.email ?? "System"}</td>
                    <td className="px-3 py-4">{post.reviewer?.name ?? post.reviewer?.email ?? "Brak"}</td>
                    <td className="px-3 py-4">{post._count.revisions}</td>
                    <td className="px-3 py-4">{formatDate(post.updatedAt)}</td>
                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline"><Link href={`/admin/blog/${post.id}/preview` as Route}>Preview</Link></Button>
                        {canEditCmsDraft(actor) && <Button asChild size="sm"><Link href={`/admin/blog/${post.id}/edit` as Route}>Edytuj</Link></Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {posts.length === 0 && (
            <div className="py-10 text-center text-sm text-[var(--text-muted)]">Brak wpisow CMS. Seed migracyjny moze przeniesc obecne artykuly statyczne.</div>
          )}
        </Card>
      </div>
    </main>
  );
}

function toneForStatus(status: string) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "IN_REVIEW" || status === "SCHEDULED") return "warning" as const;
  if (status === "ARCHIVED") return "neutral" as const;
  return "outline" as const;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}
