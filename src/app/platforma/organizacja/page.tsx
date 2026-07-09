import { revalidatePath } from "next/cache";

import { PortalCard } from "@/components/portal/portal-shell";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";
import { portalOrganizationUpdateSchema } from "@/server/portal/client-portal-schemas";
import { getClientOrganization, updateClientOrganizationProfile } from "@/server/portal/client-portal-service";

export default async function ClientOrganizationPage() {
  const actor = await requireClientPortalActor();
  const organization = await getClientOrganization(actor);

  async function updateOrganization(formData: FormData) {
    "use server";
    const actionActor = await requireClientPortalActor();
    const input = portalOrganizationUpdateSchema.parse({
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      website: String(formData.get("website") ?? ""),
      addressLine1: String(formData.get("addressLine1") ?? ""),
      addressLine2: String(formData.get("addressLine2") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      city: String(formData.get("city") ?? ""),
    });
    await updateClientOrganizationProfile(actionActor, input);
    revalidatePath("/platforma/organizacja");
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[var(--text-muted)]">Portal klienta</p>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Organizacja</h1>
      </div>
      <PortalCard>
        <h2 className="text-xl font-bold text-[var(--text-strong)]">{organization.name}</h2>
        <dl className="mt-5 grid gap-3 md:grid-cols-2">
          <Info label="NIP" value={organization.nip ?? "-"} />
          <Info label="REGON/KRS" value={organization.regon ?? "-"} />
          <Info label="Branza" value={organization.industry ?? "-"} />
          <Info label="Status" value={organization.status} />
        </dl>
      </PortalCard>

      <PortalCard>
        <h2 className="font-bold text-[var(--text-strong)]">Dane kontaktowe</h2>
        <form action={updateOrganization} className="mt-4 grid gap-4 md:grid-cols-2">
          <Input defaultValue={organization.email ?? ""} label="E-mail" name="email" type="email" />
          <Input defaultValue={organization.phone ?? ""} label="Telefon" name="phone" />
          <Input defaultValue={organization.website ?? ""} label="Strona WWW" name="website" />
          <Input defaultValue={organization.city ?? ""} label="Miasto" name="city" />
          <Input defaultValue={organization.addressLine1 ?? ""} label="Adres 1" name="addressLine1" />
          <Input defaultValue={organization.addressLine2 ?? ""} label="Adres 2" name="addressLine2" />
          <Input defaultValue={organization.postalCode ?? ""} label="Kod pocztowy" name="postalCode" />
          <div className="md:col-span-2">
            <button className="rounded-[var(--radius-sm)] bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white" type="submit">
              Zapisz dane
            </button>
          </div>
        </form>
      </PortalCard>

      <PortalCard>
        <h2 className="font-bold text-[var(--text-strong)]">Osoby kontaktowe</h2>
        <div className="mt-3 grid gap-3">
          {organization.contactPersons.map((person) => (
            <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-3" key={person.id}>
              <p className="font-semibold">{person.fullName}</p>
              <p className="text-sm text-[var(--text-muted)]">{[person.role, person.email, person.phone].filter(Boolean).join(" · ") || "-"}</p>
            </div>
          ))}
          {organization.contactPersons.length === 0 && <p className="text-sm text-[var(--text-muted)]">Brak osob kontaktowych.</p>}
        </div>
      </PortalCard>
    </div>
  );
}

function Input({ defaultValue, label, name, type = "text" }: { defaultValue: string; label: string; name: string; type?: string }) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input className="mt-1 h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3" defaultValue={defaultValue} name={name} type={type} />
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-1 font-semibold text-[var(--text-strong)]">{value}</dd>
    </div>
  );
}
