import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ClientPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Client portal</h1>
      <p className="mt-2 text-sm text-muted-foreground">Panel klienta dla formularzy, plikow i dokumentow.</p>
      <Button asChild className="mt-6">
        <Link href={"/platforma/wnioski-osob" as Route}>Wnioski osob</Link>
      </Button>
    </main>
  );
}
