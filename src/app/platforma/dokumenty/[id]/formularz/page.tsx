import type { Metadata } from "next";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitDocumentInputFormAction } from "@/server/platform/actions";
import { formatDateTime, getClientDocumentForm } from "@/server/platform/data";
import { resolvePlatformContext, type PlatformSearchParams } from "../../../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Formularz dokumentu - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function ClientDocumentFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: PlatformSearchParams;
}) {
  const context = await resolvePlatformContext(searchParams);
  if (!context) return <ClientPortalAccessDenied />;
  if (!context.activeAccess) return <ClientPortalNoOrganization context={context} />;

  const organizationId = context.activeAccess.organization.id;
  const { id } = await params;
  const item = await getClientDocumentForm(organizationId, id);
  if (!item) notFound();

  const latestSubmission = item.formSubmissions[0];
  const previousData = toFormDefaults(latestSubmission?.data);

  return (
    <ClientPortalShell activePath="/platforma/dokumenty" context={context}>
      <ClientBackLink href={withOrg("/platforma/dokumenty", organizationId)} />
      <ClientPageHeader
        eyebrow="Formularz dokumentu"
        subtitle="Uzupełnij dane potrzebne do przygotowania dokumentu. Po wysłaniu formularz trafi do audytu i osi zdarzeń."
        title={item.productName}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form action={submitDocumentInputFormAction} className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-xs)]">
          <input name="organizationId" type="hidden" value={organizationId} />
          <input name="orderItemId" type="hidden" value={item.id} />

          <Field htmlFor="administratorName" label="Administrator danych" required>
            <Input
              defaultValue={previousData.administratorName}
              id="administratorName"
              name="administratorName"
              placeholder="Nazwa administratora danych"
              required
            />
          </Field>

          <Field htmlFor="processingPurpose" label="Cel przetwarzania" required>
            <Textarea
              defaultValue={previousData.processingPurpose}
              id="processingPurpose"
              name="processingPurpose"
              placeholder="Opisz, po co organizacja przetwarza dane w tym procesie"
              required
            />
          </Field>

          <Field htmlFor="dataCategories" label="Kategorie danych i osob" required>
            <Textarea
              defaultValue={previousData.dataCategories}
              id="dataCategories"
              name="dataCategories"
              placeholder="Np. dane kontaktowe klientow, dane pracownikow, dane rozliczeniowe"
              required
            />
          </Field>

          <Field htmlFor="notes" label="Uwagi dla zespolu PRIVAZY">
            <Textarea
              defaultValue={previousData.notes}
              id="notes"
              name="notes"
              placeholder="Dodaj kontekst, wyjatki lub pytania do prawnika"
            />
          </Field>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button asChild variant="outline">
              <Link href={withOrg("/platforma/dokumenty", organizationId)}>Anuluj</Link>
            </Button>
            <Button type="submit">Wyslij formularz</Button>
          </div>
        </form>

        <aside className="grid content-start gap-4">
          <ClientInfoPanel title="Pozycja zamowienia">
            <ClientKeyValue label="Zamowienie" value={item.order.orderNumber} />
            <ClientKeyValue label="Status pozycji" value={<ClientStatusBadge status={item.status} />} />
            <ClientKeyValue label="Status zamowienia" value={<ClientStatusBadge status={item.order.status} />} />
            <ClientKeyValue label="Utworzono" value={formatDateTime(item.order.createdAt)} />
          </ClientInfoPanel>

          <ClientInfoPanel title="Ostatnie wysylki">
            {item.formSubmissions.length === 0 ? (
              <p className="text-sm leading-6 text-[var(--text-muted)]">Nie wyslano jeszcze formularza dla tej pozycji.</p>
            ) : (
              item.formSubmissions.map((submission) => (
                <ClientKeyValue
                  key={submission.id}
                  label={formatDateTime(submission.createdAt)}
                  value={<ClientStatusBadge status={submission.status} />}
                />
              ))
            )}
          </ClientInfoPanel>
        </aside>
      </div>
    </ClientPortalShell>
  );
}

function toFormDefaults(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      administratorName: "",
      dataCategories: "",
      notes: "",
      processingPurpose: "",
    };
  }

  const record = value as Record<string, unknown>;

  return {
    administratorName: typeof record.administratorName === "string" ? record.administratorName : "",
    dataCategories: typeof record.dataCategories === "string" ? record.dataCategories : "",
    notes: typeof record.notes === "string" ? record.notes : "",
    processingPurpose: typeof record.processingPurpose === "string" ? record.processingPurpose : "",
  };
}
