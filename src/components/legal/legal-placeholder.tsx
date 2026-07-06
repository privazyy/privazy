import Link from "next/link";
import type { Route } from "next";
import { FileText } from "lucide-react";

import { ShopShell } from "@/components/shop/shop-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LegalPlaceholderPage({ title }: { title: string }) {
  return (
    <ShopShell>
      <section className="bg-[var(--surface-page)] pvz-section">
        <div className="mx-auto grid w-full max-w-[760px] gap-5 px-[var(--gutter)] text-center">
          <FileText className="mx-auto size-11 text-[var(--brand)]" />
          <Badge tone="warning" className="mx-auto">
            Draft
          </Badge>
          <h1 className="text-[var(--fs-h1)] font-bold">{title}</h1>
          <p className="text-base leading-7 text-[var(--text-body)]">
            Ta trasa jest placeholderem technicznym dla checkoutu sandbox. Finalna tresc prawna wymaga osobnego review przed
            publikacja produkcyjnej sprzedazy.
          </p>
          <Button asChild className="mx-auto">
            <Link href={"/sklep" as Route}>Wroc do sklepu</Link>
          </Button>
        </div>
      </section>
    </ShopShell>
  );
}
