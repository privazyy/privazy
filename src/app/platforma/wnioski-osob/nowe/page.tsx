import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DsrPageHeader } from "@/components/dsr/dsr-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requirePortalDsrActor } from "@/server/dsr/access";
import { portalDsrCreateSchema } from "@/server/dsr/schemas";
import { createPortalDsrRequest, submitPortalDsrRequest } from "@/server/dsr/service";

export const metadata: Metadata = {
  title: "Nowy wniosek DSR - privazy.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function createDsr(formData: FormData) {
  "use server";

  const actor = await requirePortalDsrActor();
  const intent = String(formData.get("_intent") ?? "draft");
  const input = portalDsrCreateSchema.parse({
    requesterName: formData.get("requesterName"),
    requesterEmail: formData.get("requesterEmail"),
    requesterPhone: formData.get("requesterPhone") || undefined,
    relationship: formData.get("relationship") || undefined,
    type: formData.get("type"),
    priority: formData.get("priority") || "NORMAL",
    requestDescription: formData.get("requestDescription"),
    additionalInformation: formData.get("additionalInformation") || undefined,
  });
  const created = await createPortalDsrRequest(input, actor);
  if (intent === "submit") {
    await submitPortalDsrRequest(created.id, actor);
  }
  redirect(`/platforma/wnioski-osob/${created.id}`);
}

export default async function NewPortalDsrPage() {
  await requirePortalDsrActor();

  return (
    <div className="space-y-5">
      <DsrPageHeader eyebrow="Platforma klienta" title="Nowy wniosek osoby" />
      <Card padding="md" variant="flat">
        <form action={createDsr} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
              Imie i nazwisko
              <Input name="requesterName" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
              E-mail
              <Input name="requesterEmail" required type="email" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
              Telefon
              <Input name="requesterPhone" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
              Relacja
              <Input name="relationship" placeholder="Klient, pracownik, kandydat..." />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
              Typ wniosku
              <Select name="type" required>
                <option value="ACCESS">Dostep</option>
                <option value="COPY">Kopia danych</option>
                <option value="RECTIFICATION">Sprostowanie</option>
                <option value="ERASURE">Usuniecie</option>
                <option value="RESTRICTION">Ograniczenie</option>
                <option value="PORTABILITY">Przeniesienie</option>
                <option value="OBJECTION">Sprzeciw</option>
                <option value="WITHDRAW_CONSENT">Cofniecie zgody</option>
                <option value="AUTOMATED_DECISION">Automatyczna decyzja</option>
                <option value="OTHER">Inne</option>
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
              Priorytet
              <Select name="priority" defaultValue="NORMAL">
                <option value="LOW">Niski</option>
                <option value="NORMAL">Normalny</option>
                <option value="HIGH">Wysoki</option>
                <option value="URGENT">Pilny</option>
              </Select>
            </label>
          </div>
          <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
            Tresc wniosku
            <Textarea name="requestDescription" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
            Dodatkowe informacje
            <Textarea name="additionalInformation" />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button name="_intent" type="submit" value="draft" variant="outline">
              Zapisz szkic
            </Button>
            <Button name="_intent" type="submit" value="submit">
              Wyslij
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
