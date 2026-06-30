import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireUser } from "@/server/auth/guards";

export default async function PlatformaPage() {
  await requireUser({ mode: "redirect", redirectTo: "/login?callbackUrl=/platforma" });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Platforma klienta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Przyszły portal klienta dla formularzy, plików i pobierania dokumentów.
          </p>
        </div>
        <SignOutButton />
      </div>
    </main>
  );
}
