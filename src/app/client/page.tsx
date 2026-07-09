import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ClientPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Portal klienta</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bezpieczny dostęp do formularzy dokumentów, rejestru naruszeń i żądań osób.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href={"/platforma/dokumenty" as Route}>Formularze dokumentów</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={"/platforma/naruszenia" as Route}>Naruszenia</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={"/platforma/wnioski-osob" as Route}>Żądania osób</Link>
        </Button>
      </div>
    </main>
  );
}
