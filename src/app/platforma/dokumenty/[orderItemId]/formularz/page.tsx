import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { FileText } from "lucide-react";

import { ShopShell } from "@/components/shop/shop-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Formularz dokumentu - placeholder PRIVAZY",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function DocumentInputPlaceholderRoute({
  params,
}: {
  params: Promise<{ orderItemId: string }>;
}) {
  const { orderItemId } = await params;

  return (
    <ShopShell>
      <section className="bg-[var(--surface-page)] pvz-section">
        <div className="mx-auto grid w-full max-w-[760px] gap-5 px-[var(--gutter)] text-center">
          <FileText className="mx-auto size-11 text-[var(--brand)]" />
          <Badge tone="warning" className="mx-auto">
            Faza 6R
          </Badge>
          <h1 className="text-[var(--fs-h1)] font-bold">Formularz dokumentu nie jest jeszcze aktywny</h1>
          <p className="text-base leading-7 text-[var(--text-body)]">
            Pozycja zamowienia {orderItemId} jest przygotowana pod zebranie danych do dokumentu. Generator i formularze beda
            podlaczone w Fazie 6R.
          </p>
          <Button asChild className="mx-auto">
            <Link href={"/sklep" as Route}>Wroc do sklepu</Link>
          </Button>
        </div>
      </section>
    </ShopShell>
  );
}
