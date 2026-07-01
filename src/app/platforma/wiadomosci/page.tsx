import type { Metadata } from "next";

import {
  ClientEmptyState,
  ClientInfoPanel,
  ClientKeyValue,
  ClientPageHeader,
  ClientPortalAccessDenied,
  ClientPortalNoOrganization,
  ClientPortalShell,
  ClientStatusBadge,
} from "@/components/client/client-portal";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClientMessageAction } from "@/server/platform/actions";
import { formatDateTime, getClientMessages } from "@/server/platform/data";
import { resolvePlatformContext, type PlatformSearchParams } from "../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Wiadomosci - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function ClientMessagesPage({ searchParams }: { searchParams: PlatformSearchParams }) {
  const context = await resolvePlatformContext(searchParams);
  if (!context) return <ClientPortalAccessDenied />;
  if (!context.activeAccess) return <ClientPortalNoOrganization context={context} />;

  const organizationId = context.activeAccess.organization.id;
  const threads = await getClientMessages(organizationId);

  return (
    <ClientPortalShell activePath="/platforma/wiadomosci" context={context}>
      <ClientPageHeader
        eyebrow="Wiadomosci"
        subtitle="Bezpieczne watki klienta z zespolem PRIVAZY. Widoczne sa tylko watki aktywnej organizacji."
        title="Wiadomosci"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="grid gap-4">
          {threads.length === 0 ? (
            <ClientEmptyState title="Brak watkow">Utworz pierwsza wiadomosc do zespolu PRIVAZY.</ClientEmptyState>
          ) : (
            threads.map((thread) => (
              <article
                className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-xs)]"
                key={thread.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{thread.subject}</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Ostatnia wiadomosc: {formatDateTime(thread.lastMessageAt)}</p>
                  </div>
                  <ClientStatusBadge status={thread.status} />
                </div>

                <div className="grid gap-3">
                  {thread.messages.map((message) => (
                    <div
                      className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-3"
                      key={message.id}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[var(--text-muted)]">
                        <span>{message.senderUser?.name ?? message.senderUser?.email ?? message.senderType}</span>
                        <span>{formatDateTime(message.createdAt)}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text-body)]">{message.body}</p>
                    </div>
                  ))}
                </div>

                <form action={createClientMessageAction} className="grid gap-3 border-t border-[var(--border-subtle)] pt-4">
                  <input name="organizationId" type="hidden" value={organizationId} />
                  <input name="threadId" type="hidden" value={thread.id} />
                  <input name="subject" type="hidden" value={thread.subject} />
                  <Field htmlFor={`reply-${thread.id}`} label="Odpowiedz">
                    <Textarea id={`reply-${thread.id}`} name="body" placeholder="Dopisz wiadomosc do watku" required />
                  </Field>
                  <div className="flex justify-end">
                    <Button size="sm" type="submit">Wyslij odpowiedz</Button>
                  </div>
                </form>
              </article>
            ))
          )}
        </section>

        <aside className="grid content-start gap-4">
          <form action={createClientMessageAction} className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-xs)]">
            <input name="organizationId" type="hidden" value={organizationId} />
            <Field htmlFor="subject" label="Temat" required>
              <Input id="subject" name="subject" placeholder="Np. pytanie o dokument albo status sprawy" required />
            </Field>
            <Field htmlFor="body" label="Wiadomosc" required>
              <Textarea id="body" name="body" placeholder="Napisz wiadomosc do zespolu PRIVAZY" required />
            </Field>
            <Button type="submit">Wyslij wiadomosc</Button>
          </form>

          <ClientInfoPanel title="Widocznosc watkow">
            <ClientKeyValue label="Zakres" value="Aktywna organizacja" />
            <ClientKeyValue label="Audyt" value="Kazda wiadomosc tworzy wpis na osi zdarzen" />
            <ClientKeyValue label="Zalaczniki" value="Model danych jest przygotowany na klucze plikow, upload jest poza tym etapem" />
          </ClientInfoPanel>
        </aside>
      </div>
    </ClientPortalShell>
  );
}
