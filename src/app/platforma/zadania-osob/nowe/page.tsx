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
import { createDataSubjectRequestAction } from "@/server/platform/actions";
import { resolvePlatformContext, type PlatformSearchParams } from "../../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Nowe zadanie osoby - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function NewClientRequestPage({ searchParams }: { searchParams: PlatformSearchParams }) {
  const context = await resolvePlatformContext(searchParams);
  if (!context) return <ClientPortalAccessDenied />;
  if (!context.activeAccess) return <ClientPortalNoOrganization context={context} />;

  const organizationId = context.activeAccess.organization.id;

  return (
    <ClientPortalShell activePath="/platforma/zadania-osob" context={context}>
      <ClientBackLink href={withOrg("/platforma/zadania-osob", organizationId)} />
      <ClientPageHeader
        eyebrow="Nowe zadanie osoby"
        subtitle="Zarejestruj zadanie od osoby, ktorej dane dotycza. Platforma wyliczy termin 30 dni i utworzy zadanie CRM."
        title="Dodaj zadanie osoby"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form action={createDataSubjectRequestAction} className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-xs)]">
          <input name="organizationId" type="hidden" value={organizationId} />

          <div className="grid gap-4 md:grid-cols-2">
            <Field htmlFor="subjectName" label="Osoba" required>
              <Input id="subjectName" name="subjectName" placeholder="Imie, nazwisko albo identyfikator osoby" required />
            </Field>
            <Field htmlFor="subjectEmail" label="Email osoby">
              <Input id="subjectEmail" name="subjectEmail" placeholder="email@example.com" type="email" />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field htmlFor="type" label="Typ zadania" required>
              <Select defaultValue="ACCESS" id="type" name="type" required>
                <option value="ACCESS">Dostep</option>
                <option value="RECTIFICATION">Sprostowanie</option>
                <option value="ERASURE">Usuniecie</option>
                <option value="RESTRICTION">Ograniczenie</option>
                <option value="PORTABILITY">Przeniesienie</option>
                <option value="OBJECTION">Sprzeciw</option>
                <option value="CONSENT_WITHDRAWAL">Cofniecie zgody</option>
                <option value="OTHER">Inne</option>
              </Select>
            </Field>
            <Field htmlFor="receivedAt" label="Data otrzymania" required>
              <Input id="receivedAt" name="receivedAt" required type="date" />
            </Field>
            <Field htmlFor="verified" label="Tozsamosc" required>
              <Select defaultValue="no" id="verified" name="verified" required>
                <option value="no">Do weryfikacji</option>
                <option value="yes">Zweryfikowana</option>
              </Select>
            </Field>
          </div>

          <Field htmlFor="channel" label="Kanal" required>
            <Input id="channel" name="channel" placeholder="Np. email, formularz, telefon, pismo" required />
          </Field>

          <Field htmlFor="summary" label="Tresc zadania" required>
            <Textarea id="summary" name="summary" placeholder="Opisz czego dotyczy zadanie i jakie dane lub procesy nalezy sprawdzic" required />
          </Field>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button asChild variant="outline">
              <Link href={withOrg("/platforma/zadania-osob", organizationId)}>Anuluj</Link>
            </Button>
            <Button type="submit">Zapisz zadanie</Button>
          </div>
        </form>

        <aside className="grid content-start gap-4">
          <ClientInfoPanel title="Co stanie sie po wyslaniu">
            <ClientKeyValue label="Termin" value="30 dni od daty otrzymania" />
            <ClientKeyValue label="Weryfikacja" value="Brak weryfikacji ustawi status do sprawdzenia tozsamosci" />
            <ClientKeyValue label="CRM" value="Powstanie zadanie dla zespolu PRIVAZY" />
            <ClientKeyValue label="Audyt" value="Wpis trafi do audit log i osi zdarzen klienta" />
          </ClientInfoPanel>
        </aside>
      </div>
    </ClientPortalShell>
  );
}
