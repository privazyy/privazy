import type { Metadata } from "next";

import {
  ClientInfoPanel,
  ClientKeyValue,
  ClientPageHeader,
  ClientPortalAccessDenied,
  ClientPortalNoOrganization,
  ClientPortalShell,
  ClientStatusBadge,
} from "@/components/client/client-portal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateOrganizationSettingsAction } from "@/server/platform/actions";
import { formatDateTime, getClientOrganizationSettings } from "@/server/platform/data";
import { resolvePlatformContext, type PlatformSearchParams } from "../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Ustawienia - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function ClientSettingsPage({ searchParams }: { searchParams: PlatformSearchParams }) {
  const context = await resolvePlatformContext(searchParams);
  if (!context) return <ClientPortalAccessDenied />;
  if (!context.activeAccess) return <ClientPortalNoOrganization context={context} />;

  const organizationId = context.activeAccess.organization.id;
  const organization = await getClientOrganizationSettings(organizationId);

  return (
    <ClientPortalShell activePath="/platforma/ustawienia" context={context}>
      <ClientPageHeader
        eyebrow="Ustawienia"
        subtitle="Podstawowe dane organizacji i lista kont klienta. Edycja jest ograniczona do roli OWNER, ADMIN albo wewnetrznego ADMIN."
        title="Ustawienia organizacji"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="grid gap-4">
          <form action={updateOrganizationSettingsAction} className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-xs)]">
            <input name="organizationId" type="hidden" value={organizationId} />
            <Field htmlFor="name" label="Nazwa organizacji" required>
              <Input defaultValue={organization?.name ?? ""} disabled={!context.activeAccess.canManage} id="name" name="name" required />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field htmlFor="email" label="Email">
                <Input defaultValue={organization?.email ?? ""} disabled={!context.activeAccess.canManage} id="email" name="email" type="email" />
              </Field>
              <Field htmlFor="phone" label="Telefon">
                <Input defaultValue={organization?.phone ?? ""} disabled={!context.activeAccess.canManage} id="phone" name="phone" />
              </Field>
            </div>
            <Field htmlFor="website" label="Strona www">
              <Input defaultValue={organization?.website ?? ""} disabled={!context.activeAccess.canManage} id="website" name="website" />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Badge tone={context.activeAccess.canManage ? "success" : "warning"}>
                {context.activeAccess.canManage ? "Mozesz edytowac" : "Tylko odczyt"}
              </Badge>
              <Button disabled={!context.activeAccess.canManage} type="submit">Zapisz dane</Button>
            </div>
          </form>
        </section>

        <aside className="grid content-start gap-4">
          <ClientInfoPanel title="Profil organizacji">
            <ClientKeyValue label="NIP" value={organization?.nip ?? "Brak"} />
            <ClientKeyValue label="REGON" value={organization?.regon ?? "Brak"} />
            <ClientKeyValue label="Adres" value={formatAddress(organization)} />
            <ClientKeyValue label="Utworzono" value={formatDateTime(organization?.createdAt)} />
            <ClientKeyValue label="Aktualizacja" value={formatDateTime(organization?.updatedAt)} />
          </ClientInfoPanel>

          <ClientInfoPanel title="Czlonkowie platformy">
            {organization?.clientProfiles.length ? (
              organization.clientProfiles.map((profile) => (
                <ClientKeyValue
                  key={profile.id}
                  label={profile.user.name ?? profile.user.email}
                  value={
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge tone={profile.role === "OWNER" || profile.role === "ADMIN" ? "brand" : "neutral"}>{profile.role}</Badge>
                      {profile.acceptedAt ? <ClientStatusBadge status="DONE" /> : <ClientStatusBadge status="PENDING" />}
                    </span>
                  }
                />
              ))
            ) : (
              <p className="text-sm leading-6 text-[var(--text-muted)]">Brak profili klienta przypisanych do tej organizacji.</p>
            )}
          </ClientInfoPanel>
        </aside>
      </div>
    </ClientPortalShell>
  );
}

function formatAddress(organization: Awaited<ReturnType<typeof getClientOrganizationSettings>>) {
  if (!organization?.addressLine1) return "Brak";
  return [organization.addressLine1, organization.addressLine2, `${organization.postalCode ?? ""} ${organization.city ?? ""}`.trim(), organization.country]
    .filter(Boolean)
    .join(", ");
}
