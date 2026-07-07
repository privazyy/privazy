import { DocumentRequestForm } from "@/components/forms/document-request-form";

export default function DocumentsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Generowanie dokumentu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Publiczny flow demo jest zablokowany. Generowanie wymaga teraz sesji staff i weryfikacji zasobow
          po stronie serwera.
        </p>
      </div>
      <DocumentRequestForm />
    </main>
  );
}
