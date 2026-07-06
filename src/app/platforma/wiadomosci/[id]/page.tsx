import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ClientBackLink,
  ClientInfoPanel,
  ClientKeyValue,
  ClientPageHeader,
  ClientPortalAccessDenied,
  ClientPortalNoOrganization,
  ClientPortalShell,
  ClientStatusBadge,
  withOrg,
} from "@/components/client/client-portal";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { createClientMessageAction } from "@/server/platform/actions";
import { formatDateTime, getClientMessageThread } from "@/server/platform/queries";
import { resolvePlatformContext, type PlatformSearchParams } from "../../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Watek wiadomosci - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function ClientMessageThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: PlatformSearchParams;
}) {
  const context = await resolvePlatformContext(searchParams);
  if (!context) return <ClientPortalAccessDenied />;
  if (!context.activeAccess) return <ClientPortalNoOrganization context={context} />;

  const { id } = await params;
  const organizationId = context.activeAccess.organization.id;
  const thread = await getClientMessageThread(organizationId, id);
  if (!thread) notFound();

  return (
    <ClientPortalShell activePath="/platforma/wiadomosci" context={context}>
      <ClientBackLink href={withOrg("/platforma/wiadomosci", organizationId)} />
      <ClientPageHeader
        action={<ClientStatusBadge status={thread.status} />}
        eyebrow="Wiadomosci"
        subtitle="Watek jest widoczny tylko w aktywnej organizacji. Notatki wewnetrzne CRM nie sa tutaj pokazywane."
        title={thread.subject}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-3">
          {thread.messages.map((message) => (
            <article
              className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-xs)]"
              key={message.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[var(--text-muted)]">
                <span>{message.senderUser?.name ?? message.senderUser?.email ?? message.senderType}</span>
                <span>{formatDateTime(message.createdAt)}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--text-body)]">{message.body}</p>
            </article>
          ))}

          <form action={createClientMessageAction} className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-xs)]">
            <input name="organizationId" type="hidden" value={organizationId} />
            <input name="threadId" type="hidden" value={thread.id} />
            <input name="subject" type="hidden" value={thread.subject} />
            <Field htmlFor="reply" label="Odpowiedz">
              <Textarea id="reply" name="body" placeholder="Dopisz wiadomosc do watku" required />
            </Field>
            <div className="flex justify-end">
              <Button type="submit">Wyslij odpowiedz</Button>
            </div>
          </form>
        </section>

        <aside className="grid content-start gap-4">
          <ClientInfoPanel title="Szczegoly watku">
            <ClientKeyValue label="Utworzony" value={formatDateTime(thread.createdAt)} />
            <ClientKeyValue label="Ostatnia wiadomosc" value={formatDateTime(thread.lastMessageAt)} />
            <ClientKeyValue label="Zalozyl" value={thread.createdBy?.name ?? thread.createdBy?.email ?? "Platforma klienta"} />
            <ClientKeyValue label="Powiazanie" value={thread.relatedEntityType ?? "Brak"} />
          </ClientInfoPanel>

          <ClientInfoPanel title="Widocznosc">
            <ClientKeyValue label="Organizacja" value={context.activeAccess.organization.name} />
            <ClientKeyValue label="Notatki CRM" value="Tylko komentarze klient-widoczne trafiaja do portalu" />
            <ClientKeyValue label="Zalaczniki" value="Upload plikow pozostaje poza zakresem tej fazy" />
          </ClientInfoPanel>
        </aside>
      </div>
    </ClientPortalShell>
  );
}
