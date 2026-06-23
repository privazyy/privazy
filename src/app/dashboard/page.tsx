import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Operacyjny widok startowy pod formularze, dokumenty i statusy jobów.
          </p>
        </div>
        <Button asChild>
          <Link href="/documents">Dokumenty</Link>
        </Button>
      </div>
    </main>
  );
}
