"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/shop/money";

type MockPaymentPanelProps = {
  amountGrossCents: number;
  currency: string;
  orderNumber: string;
  paymentId: string;
  token: string;
};

export function MockPaymentPanel({
  amountGrossCents,
  currency,
  orderNumber,
  paymentId,
  token,
}: MockPaymentPanelProps) {
  const [pending, setPending] = useState<"failed" | "succeeded" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function complete(outcome: "failed" | "succeeded") {
    setPending(outcome);
    setError(null);

    try {
      const response = await fetch("/api/payments/mock/complete", {
        body: JSON.stringify({
          eventId: `mock-ui:${paymentId}:${crypto.randomUUID()}`,
          outcome,
          paymentId,
          token,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as {
        error?: string;
        redirectUrl?: string;
      };

      if (!response.ok || !payload.redirectUrl) {
        throw new Error(payload.error ?? "Nie udało się wykonać symulacji.");
      }

      window.location.assign(payload.redirectUrl);
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Nie udało się wykonać symulacji.",
      );
      setPending(null);
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-[720px] gap-6 rounded-[var(--radius-lg)] border border-[var(--brand-border)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-md)] min-[721px]:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[var(--ls-wide)] text-[var(--brand-ink)]">
          Środowisko MOCK / SANDBOX
        </p>
        <h1 className="mt-3 text-[var(--fs-h1)] font-bold">
          Symulacja płatności
        </h1>
        <p className="mt-3 text-base leading-7 text-[var(--text-body)]">
          To nie jest prawdziwa płatność. System nie pobiera danych karty ani
          środków. Wybierz wynik, aby przetestować przejście statusów zamówienia.
        </p>
      </div>

      <dl className="grid gap-3 rounded-[var(--radius-md)] bg-[var(--surface-sunken)] p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Zamówienie</dt>
          <dd className="font-mono font-semibold">{orderNumber}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Kwota testowa</dt>
          <dd className="font-semibold">
            {formatMoney(amountGrossCents, currency)}
          </dd>
        </div>
      </dl>

      {error && (
        <p
          className="rounded-[var(--radius-md)] bg-[var(--danger-soft)] p-3 text-sm font-semibold text-[var(--red-600)]"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="grid gap-3 min-[520px]:grid-cols-2">
        <Button
          disabled={pending !== null}
          onClick={() => complete("succeeded")}
          size="lg"
          type="button"
        >
          {pending === "succeeded" && <Loader2 className="size-5 animate-spin" />}
          Symuluj sukces
        </Button>
        <Button
          disabled={pending !== null}
          onClick={() => complete("failed")}
          size="lg"
          type="button"
          variant="outline"
        >
          {pending === "failed" && <Loader2 className="size-5 animate-spin" />}
          Symuluj błąd
        </Button>
      </div>
    </section>
  );
}
