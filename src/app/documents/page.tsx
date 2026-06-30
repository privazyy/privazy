import { SignOutButton } from "@/components/auth/sign-out-button";
import { DocumentRequestForm } from "@/components/forms/document-request-form";
import { requireRole } from "@/server/auth/guards";
import { DOCUMENT_GENERATION_ROLES } from "@/server/auth/roles";

export default async function DocumentsPage() {
  await requireRole(DOCUMENT_GENERATION_ROLES, {
    mode: "redirect",
    redirectTo: "/login?callbackUrl=/documents",
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Generowanie dokumentu</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Przykładowy flow: walidacja formularza, API route, Inngest event i job generowania DOCX.
          </p>
        </div>
        <SignOutButton />
      </div>
      <DocumentRequestForm />
    </main>
  );
}
