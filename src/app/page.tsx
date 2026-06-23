import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";

const pillars = [
  { icon: ShieldCheck, label: "RODO-ready", text: "Role, audyt i prywatne pliki od pierwszego dnia." },
  { icon: FileText, label: "DOCX templates", text: "Szablony wersjonowane i generowanie przez Docxtemplater." },
  { icon: Workflow, label: "Workflow", text: "Inngest pod kolejki, retry i dłuższe procesy." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            PRIVAZY
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            Legaltech workspace dla dokumentów RODO.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Solidny fundament pod formularze, generowanie dokumentów, audyt,
            bezpieczny storage i przyszłe moduły AI.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard">
                Dashboard <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/documents">Dokumenty</Link>
            </Button>
          </div>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.label} className="rounded-lg border bg-card p-5 text-card-foreground">
              <pillar.icon className="mb-4 size-5 text-muted-foreground" />
              <h2 className="font-medium">{pillar.label}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
