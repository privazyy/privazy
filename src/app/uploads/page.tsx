import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireRole } from "@/server/auth/guards";
import { DOCUMENT_GENERATION_ROLES } from "@/server/auth/roles";

export const dynamic = "force-dynamic";

export default async function UploadsPage() {
  await requireRole(DOCUMENT_GENERATION_ROLES, {
    mode: "redirect",
    redirectTo: "/login?callbackUrl=/uploads",
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Uploads</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Przyszłe miejsce dla prywatnych uploadów klientów i importu szablonów DOCX.
          </p>
        </div>
        <SignOutButton />
      </div>
    </main>
  );
}
