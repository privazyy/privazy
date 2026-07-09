import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "outline";

export const dsrTypeLabels: Record<string, string> = {
  ACCESS: "Dostep",
  AUTOMATED_DECISION: "Automatyczna decyzja",
  COPY: "Kopia",
  ERASURE: "Usuniecie",
  OBJECTION: "Sprzeciw",
  OTHER: "Inne",
  PORTABILITY: "Przeniesienie",
  RECTIFICATION: "Sprostowanie",
  RESTRICTION: "Ograniczenie",
  WITHDRAW_CONSENT: "Cofniecie zgody",
};

export const dsrStatusLabels: Record<string, string> = {
  CANCELLED: "Anulowany",
  CLOSED: "Zamkniety",
  DRAFT: "Szkic",
  IDENTITY_VERIFICATION: "Weryfikacja",
  IN_PROGRESS: "W toku",
  RECEIVED: "Odebrany",
  REJECTED: "Odrzucony",
  RESPONDED: "Odpowiedz wyslana",
  RESPONSE_PREPARED: "Odpowiedz gotowa",
  WAITING_FOR_INFORMATION: "Czeka na informacje",
};

export function dsrStatusTone(status: string): Tone {
  if (["RESPONDED", "CLOSED"].includes(status)) return "success";
  if (["REJECTED", "CANCELLED"].includes(status)) return "danger";
  if (["DRAFT", "WAITING_FOR_INFORMATION", "IDENTITY_VERIFICATION"].includes(status)) return "warning";
  return "brand";
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function DsrStatusBadge({ status }: { status: string }) {
  return (
    <Badge dot tone={dsrStatusTone(status)}>
      {dsrStatusLabels[status] ?? status}
    </Badge>
  );
}

export function DsrPageHeader({
  actionHref,
  actionLabel,
  eyebrow,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-sm font-semibold text-[var(--brand-ink)]">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-bold text-[var(--text-strong)]">{title}</h1>
      </div>
      {actionHref && actionLabel && (
        <Button asChild>
          <Link href={actionHref as Route}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}

export function DsrEmpty({ text }: { text: string }) {
  return (
    <Card padding="md" variant="flat">
      <p className="text-sm text-[var(--text-muted)]">{text}</p>
    </Card>
  );
}
