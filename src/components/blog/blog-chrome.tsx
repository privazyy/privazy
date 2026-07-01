import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function BlogHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-slate-200 backdrop-blur-md"
      style={{ background: "var(--glass-bg)" }}
    >
      <div className="flex min-h-[72px] items-center gap-6 py-3 pvz-container">
        <Link href="/" aria-label="PRIVAZY strona główna">
          <Logo />
        </Link>
        <nav className="ml-3 hidden flex-1 items-center gap-6 text-sm font-medium text-slate-700 lg:flex">
          <Link href="/#checker" className="transition-colors hover:text-blue-700">
            Checker IOD
          </Link>
          <Link href="/uslugi/wdrozenie-rodo" className="transition-colors hover:text-blue-700">
            Usługi
          </Link>
          <Link href="/branze/ecommerce" className="transition-colors hover:text-blue-700">
            Branże
          </Link>
          <Link href="/sklep/polityka-prywatnosci" className="transition-colors hover:text-blue-700">
            Dokumenty
          </Link>
          <Link href="/blog" className="font-semibold text-blue-700">
            Blog
          </Link>
        </nav>
        <div className="ml-auto hidden items-center gap-3 sm:flex">
          <Link
            href="/admin"
            className="text-sm font-semibold text-slate-950 transition-colors hover:text-blue-700"
          >
            Zaloguj
          </Link>
          <Button asChild className="hidden lg:inline-flex">
            <Link href="/#checker">
              Sprawdź obowiązek IOD <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="sm" className="lg:hidden">
            <Link href="/#checker">Checker</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function BlogFooter() {
  const columns = [
    {
      title: "Usługi",
      links: [
        { label: "Wdrożenie RODO", href: "/uslugi/wdrozenie-rodo" },
        { label: "Outsourcing IOD", href: "/uslugi/outsourcing-iod" },
        { label: "Audyt RODO", href: "/uslugi/audyt-rodo" },
        { label: "Naruszenia danych", href: "/uslugi/naruszenia-ochrony-danych" },
      ],
    },
    {
      title: "Branże",
      links: [
        { label: "E-commerce", href: "/branze/ecommerce" },
        { label: "Placówki medyczne", href: "/branze/placowki-medyczne" },
        { label: "HR i rekrutacja", href: "/branze/hr-i-rekrutacja" },
        { label: "SaaS i IT", href: "/branze/saas-i-it" },
      ],
    },
    {
      title: "Baza wiedzy",
      links: [
        { label: "RODO i ochrona danych", href: "/blog" },
        { label: "Obowiązek IOD", href: "/blog?category=iod" },
        { label: "Dokumenty RODO", href: "/sklep/polityka-prywatnosci" },
        { label: "Kontakt", href: "mailto:kontakt@privazy.pl" },
      ],
    },
  ];

  return (
    <footer className="bg-slate-950 text-white/70">
      <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 pvz-container">
        <div>
          <Logo tone="inverse" />
          <p className="mt-4 max-w-xs text-sm leading-6">
            RODO dla firm bez chaosu: checker IOD, dokumenty, audyty, outsourcing i obsługa incydentów.
          </p>
          <a
            href="mailto:kontakt@privazy.pl"
            className="mt-4 inline-block text-sm font-semibold text-blue-300 transition hover:text-white"
          >
            kontakt@privazy.pl
          </a>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-4 text-sm font-bold uppercase text-white">{column.title}</h3>
            <ul className="space-y-3 text-sm">
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("mailto:") ? (
                    <a href={link.href} className="transition hover:text-white">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href as Route} className="transition hover:text-white">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between pvz-container">
          <span>© 2026 PRIVAZY. Wszelkie prawa zastrzeżone.</span>
          <span>Treści mają charakter ogólny i nie stanowią porady prawnej dla konkretnej sprawy.</span>
        </div>
      </div>
    </footer>
  );
}
