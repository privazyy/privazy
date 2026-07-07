import { FileLock2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DocumentRequestForm() {
  return (
    <section className="grid gap-5 rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <Badge tone="warning" dot>
            Staff-only
          </Badge>
          <h2 className="text-lg font-semibold text-foreground">Generowanie dokumentow jest zablokowane publicznie</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Publiczny formularz demo nie tworzy juz jobow z dowolnymi ID. Endpoint wymaga sesji staff oraz
            server-side verification organizacji i aktywnego template.
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-sunken)] text-[var(--brand)]">
          <FileLock2 className="size-5" aria-hidden="true" />
        </div>
      </div>
      <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
          <p>
            Tymczasowy flow produkcyjny jest dostepny wylacznie dla ADMIN, LAWYER i OPERATOR. CLIENT flow
            pozostaje zablokowany do czasu dodania Order/OrderItem lub DocumentInput gate.
          </p>
        </div>
      </div>
      <Button type="button" disabled className="w-fit">
        <FileLock2 className="size-4" />
        Tworzenie jobow wylaczone
      </Button>
    </section>
  );
}
