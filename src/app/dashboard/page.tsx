import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/server/auth/guards";

export default async function DashboardPage() {
  await requireUser({ mode: "redirect", redirectTo: "/login?callbackUrl=/dashboard" });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Operacyjny widok startowy pod formularze, dokumenty i statusy jobów.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin">CRM</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/documents">Dokumenty</Link>
          </Button>
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
