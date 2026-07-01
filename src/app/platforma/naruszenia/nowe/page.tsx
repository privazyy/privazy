import type { Metadata } from "next";
import Link from "next/link";

import {
  ClientBackLink,
  ClientInfoPanel,
  ClientKeyValue,
  ClientPageHeader,
  ClientPortalAccessDenied,
  ClientPortalNoOrganization,
  ClientPortalShell,
  withOrg,
} from "@/components/client/client-portal";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createBreachIncidentAction } from "@/server/platform/actions";
import { resolvePlatformContext, type PlatformSearchParams } from "../../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Nowe naruszenie - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function NewClientBreachPage({ searchParams }: { searchParams: PlatformSearchParams }) {
  const context = await resolvePlatformContext(searchParams);
  if (!context) return <ClientPortalAccessDenied />;
  if (!context.activeAccess) return <ClientPortalNoOrganization context={context} />;

  const organizationId = context.activeAccess.organization.id;

  return (
    <ClientPortalShell activePath="/platforma/naruszenia" context={context}>
      <ClientBackLink href={withOrg("/platforma/naruszenia", organizationId)} />
      <ClientPageHeader
        eyebrow="Nowe naruszenie"
        subtitle="Zapisz zdarzenie natychmiast po wykryciu. Platforma utworzy wpis, termin 72h, zadanie triage i zdarzenie audytowe."
        title="Zglos naruszenie ochrony danych"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form action={createBreachIncidentAction} className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-xs)]">
          <input name="organizationId" type="hidden" value={organizationId} />

          <Field htmlFor="title" label="Tytul zdarzenia" required>
            <Input id="title" name="title" placeholder="Np. wysylka danych do niewlasciwego odbiorcy" required />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field htmlFor="detectedAt" label="Data wykrycia" required>
              <Input id="detectedAt" name="detectedAt" required type="datetime-local" />
            </Field>
            <Field htmlFor="occurredAt" label="Data wystapienia">
              <Input id="occurredAt" name="occurredAt" type="datetime-local" />
            </Field>
          </div>

          <Field htmlFor="urgency" label="Wstepna pilnosc" required>
            <Select defaultValue="MEDIUM" id="urgency" name="urgency" required>
              <option value="LOW">Niska</option>
              <option value="MEDIUM">Srednia</option>
              <option value="HIGH">Wysoka</option>
              <option value="CRITICAL">Krytyczna</option>
            </Select>
          </Field>

          <Field htmlFor="summary" label="Opis zdarzenia" required>
            <Textarea id="summary" name="summary" placeholder="Co sie stalo, jak wykryto zdarzenie i jakie systemy lub procesy obejmuje" required />
          </Field>

          <Field htmlFor="dataCategories" label="Kategorie danych" required>
            <Textarea id="dataCategories" name="dataCategories" placeholder="Jakie dane mogly zostac ujawnione, utracone albo zmienione" required />
          </Field>

          <Field htmlFor="affectedPeopleEstimate" label="Szacowana liczba osob">
            <Input id="affectedPeopleEstimate" name="affectedPeopleEstimate" placeholder="Np. ok. 120 klientow" />
          </Field>

          <Field htmlFor="impact" label="Potencjalne skutki" required>
            <Textarea id="impact" name="impact" placeholder="Jakie skutki zdarzenie moze miec dla osob, organizacji albo ciaglosci procesu" required />
          </Field>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button asChild variant="outline">
              <Link href={withOrg("/platforma/naruszenia", organizationId)}>Anuluj</Link>
            </Button>
            <Button type="submit">Zapisz naruszenie</Button>
          </div>
        </form>

        <aside className="grid content-start gap-4">
          <ClientInfoPanel title="Co stanie sie po wyslaniu">
            <ClientKeyValue label="Termin" value="72h od daty wykrycia" />
            <ClientKeyValue label="CRM" value="Powstanie zadanie triage dla zespolu PRIVAZY" />
            <ClientKeyValue label="Audyt" value="Wpis trafi do audit log i osi zdarzen klienta" />
            <ClientKeyValue label="Email" value="Uzytkownik dostanie potwierdzenie zapisu" />
          </ClientInfoPanel>
        </aside>
      </div>
    </ClientPortalShell>
  );
}
