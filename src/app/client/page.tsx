import Link from "next/link";

export default function ClientPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Client portal</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Portal klienta dla formularzy, plikow i rejestru naruszen jest wdrazany etapowo.
      </p>
      <Link className="mt-6 inline-flex rounded-[var(--radius-sm)] bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white" href="/platforma/naruszenia">
        Przejdz do naruszen
      </Link>
    </main>
  );
}
