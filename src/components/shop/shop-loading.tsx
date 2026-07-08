import { Loader2 } from "lucide-react";

import { ShopShell } from "@/components/shop/shop-components";

export function ShopLoadingState({ label = "Ladowanie" }: { label?: string }) {
  return (
    <ShopShell>
      <section className="bg-[var(--surface-page)] pvz-section">
        <div className="mx-auto grid w-full max-w-[640px] gap-4 px-[var(--gutter)] text-center">
          <Loader2 className="mx-auto size-9 animate-spin text-[var(--brand)]" />
          <p className="text-sm font-semibold text-[var(--text-muted)]">{label}</p>
        </div>
      </section>
    </ShopShell>
  );
}
