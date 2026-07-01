import type { Metadata } from "next";

import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPortalAccessDenied,
  ClientPortalNoOrganization,
  ClientPortalShell,
  ClientRecordCard,
  ClientStatusBadge,
} from "@/components/client/client-portal";
import { Button } from "@/components/ui/button";
import { completeClientTaskAction } from "@/server/platform/actions";
import { formatDate, getClientTasks, priorityLabel, toneForDate } from "@/server/platform/data";
import { resolvePlatformContext, type PlatformSearchParams } from "../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Zadania - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function ClientTasksPage({ searchParams }: { searchParams: PlatformSearchParams }) {
  const context = await resolvePlatformContext(searchParams);
  if (!context) return <ClientPortalAccessDenied />;
  if (!context.activeAccess) return <ClientPortalNoOrganization context={context} />;

  const organizationId = context.activeAccess.organization.id;
  const tasks = await getClientTasks(organizationId);

  return (
    <ClientPortalShell activePath="/platforma/zadania" context={context}>
      <ClientPageHeader
        eyebrow="Zadania"
        subtitle="Zadania operacyjne powiazane z organizacja. Domkniecie zapisuje audyt i wpis na osi zdarzen."
        title="Zadania do wykonania"
      />

      <section className="grid gap-3">
        {tasks.length === 0 ? (
          <ClientEmptyState title="Brak zadan">Nie ma zadan CRM widocznych dla tej organizacji.</ClientEmptyState>
        ) : (
          tasks.map((task) => (
            <ClientRecordCard
              action={
                task.status !== "DONE" && task.status !== "CANCELLED" ? (
                  <form action={completeClientTaskAction}>
                    <input name="organizationId" type="hidden" value={organizationId} />
                    <input name="taskId" type="hidden" value={task.id} />
                    <Button size="sm" type="submit" variant="outline">Oznacz jako wykonane</Button>
                  </form>
                ) : null
              }
              key={task.id}
              meta={
                <>
                  <span>Termin: {formatDate(task.dueAt)}</span>
                  <span>Priorytet: {priorityLabel(task.priority)}</span>
                  <span>Wlasciciel: {task.owner?.name ?? task.owner?.email ?? "Nie przypisano"}</span>
                </>
              }
              status={<ClientStatusBadge status={task.status} tone={toneForDate(task.dueAt)} />}
              title={task.title}
            >
              {task.description}
            </ClientRecordCard>
          ))
        )}
      </section>
    </ClientPortalShell>
  );
}
