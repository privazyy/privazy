"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Cookie,
  Eye,
  FileCog,
  FileDown,
  FileText,
  Info,
  ListChecks,
  Lock,
  RefreshCw,
  Scale,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { Logo } from "@/components/ui/logo";
import {
  privacyPolicyProduct,
  productBundleItems,
  productComparisonRows,
  productContentItems,
  productFaqItems,
  productSteps,
  productTrustItems,
} from "@/lib/product";
import { cn } from "@/lib/utils";

type GalleryPageKey = "cover" | "content" | "cookies";

const galleryPages: Array<{ key: GalleryPageKey; label: string; icon: LucideIcon }> = [
  { key: "cover", label: "Strona tytułowa", icon: ShieldCheck },
  { key: "content", label: "Cele i retencja", icon: FileText },
  { key: "cookies", label: "Cookies", icon: Cookie },
];

const trustIcons = [ShieldCheck, Scale, RefreshCw, Zap] as const;
const stepIcons = [Building2, FileCog, ShieldCheck] as const;
const bundleIcons = [FileText, FileDown, Code2, ListChecks] as const;

export function ProductPage() {
  const [activePage, setActivePage] = useState<GalleryPageKey>("cover");
  const [cartCount, setCartCount] = useState(0);
  const [added, setAdded] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const updateSticky = () => setShowSticky(window.scrollY > 560);

    updateSticky();
    window.addEventListener("scroll", updateSticky, { passive: true });

    return () => window.removeEventListener("scroll", updateSticky);
  }, []);

  const addToCart = () => {
    setCartCount((current) => current + 1);
    setAdded(true);
  };

  const scrollToContent = () => {
    document.getElementById("zawartosc")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--surface-page)] pb-24 text-[var(--text-strong)] pvz-bleed-safe">
      <ProductHeader cartCount={cartCount} onAdd={addToCart} />
      <Breadcrumbs />
      <Hero
        activePage={activePage}
        added={added}
        onAdd={addToCart}
        onScrollToContent={scrollToContent}
        onSelectPage={setActivePage}
      />
      <TrustStrip />
      <ContentSection />
      <StepsSection />
      <ComparisonSection />
      <FaqSection openFaq={openFaq} onChange={setOpenFaq} />
      <SeoProse />
      <CtaBand added={added} onAdd={addToCart} />
      <ProductFooter />
      <StickyBuyBar added={added} show={showSticky} onAdd={addToCart} />
    </main>
  );
}

function ProductHeader({ cartCount, onAdd }: { cartCount: number; onAdd: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-md">
      <div className="mx-auto flex h-[68px] w-full max-w-[var(--container)] items-center gap-4 px-[var(--gutter)] min-[921px]:gap-8">
        <Link href={"/" as Route} aria-label="PRIVAZY strona główna" className="shrink-0">
          <Logo />
        </Link>
        <Badge tone="brand" className="hidden shrink-0 min-[380px]:inline-flex">
          Sklep
        </Badge>

        <nav className="ml-2 hidden flex-1 items-center gap-6 text-sm font-medium text-[var(--text-body)] min-[921px]:flex">
          <Link href={"/#dokumenty" as Route} className="transition-colors hover:text-[var(--brand-ink)]">
            Dokumenty
          </Link>
          <Link href={"/#cennik" as Route} className="transition-colors hover:text-[var(--brand-ink)]">
            Pakiety
          </Link>
          <Link href={"/#checker" as Route} className="transition-colors hover:text-[var(--brand-ink)]">
            Checker IOD
          </Link>
          <Link href={"/blog" as Route} className="transition-colors hover:text-[var(--brand-ink)]">
            Blog
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 min-[520px]:gap-3">
          <a
            href="mailto:kontakt@privazy.pl"
            className="hidden text-sm font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--brand-ink)] min-[721px]:inline-flex"
          >
            Pomoc
          </a>
          <Button type="button" size="sm" className="hidden min-[520px]:inline-flex" onClick={onAdd}>
            Dodaj do koszyka
          </Button>
          <IconButton label={`Koszyk: ${cartCount} produktów`} className="relative shrink-0">
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-[var(--brand)] px-1.5 text-[11px] font-bold leading-5 text-white">
                {cartCount}
              </span>
            )}
          </IconButton>
        </div>
      </div>
    </header>
  );
}

function Breadcrumbs() {
  return (
    <div className="border-b border-[var(--border-subtle)] bg-white">
      <div className="py-3 pvz-container">
        <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
          <Link href={"/" as Route} className="transition-colors hover:text-[var(--brand-ink)]">
            Strona główna
          </Link>
          <ChevronRight className="size-3.5 text-[var(--text-faint)]" />
          <Link href={"/#dokumenty" as Route} className="transition-colors hover:text-[var(--brand-ink)]">
            Dokumenty
          </Link>
          <ChevronRight className="size-3.5 text-[var(--text-faint)]" />
          <span className="font-semibold text-[var(--text-strong)]">{privacyPolicyProduct.shortName}</span>
        </nav>
      </div>
    </div>
  );
}

function Hero({
  activePage,
  added,
  onAdd,
  onScrollToContent,
  onSelectPage,
}: {
  activePage: GalleryPageKey;
  added: boolean;
  onAdd: () => void;
  onScrollToContent: () => void;
  onSelectPage: (page: GalleryPageKey) => void;
}) {
  return (
    <section className="border-b border-[var(--border-subtle)] bg-white">
      <div className="grid items-start gap-10 py-10 min-[921px]:grid-cols-[0.96fr_1.04fr] min-[921px]:gap-14 min-[921px]:py-16 pvz-container">
        <ProductGallery activePage={activePage} onSelectPage={onSelectPage} />
        <BuyPanel added={added} onAdd={onAdd} onScrollToContent={onScrollToContent} />
      </div>
    </section>
  );
}

function ProductGallery({
  activePage,
  onSelectPage,
}: {
  activePage: GalleryPageKey;
  onSelectPage: (page: GalleryPageKey) => void;
}) {
  return (
    <div className="min-w-0">
      <div className="relative aspect-[1/1.08] overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--gray-50)] p-4 shadow-[var(--shadow-lg)] sm:p-6">
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-white/85 px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] shadow-[var(--shadow-xs)] backdrop-blur-sm">
          <Eye className="size-3.5" /> Podgląd dokumentu
        </span>
        <div className="relative h-full">
          <PreviewPage active={activePage === "cover"}>
            <DocumentCover />
          </PreviewPage>
          <PreviewPage active={activePage === "content"}>
            <DocumentContent />
          </PreviewPage>
          <PreviewPage active={activePage === "cookies"}>
            <DocumentCookies />
          </PreviewPage>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {galleryPages.map((page) => {
          const Icon = page.icon;
          const active = activePage === page.key;

          return (
            <button
              key={page.key}
              type="button"
              aria-pressed={active}
              className={cn(
                "min-h-[74px] rounded-[var(--radius-md)] border bg-white p-2 text-left transition-[border-color,box-shadow] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
                active ? "border-[var(--brand)] shadow-[var(--shadow-sm)]" : "border-[var(--border-subtle)] hover:border-[var(--brand-border)]",
              )}
              onClick={() => onSelectPage(page.key)}
            >
              <span
                className={cn(
                  "flex h-full items-end rounded-[var(--radius-sm)] p-2 text-xs font-bold",
                  active ? "bg-[linear-gradient(135deg,var(--blue-600),var(--blue-500))] text-white" : "bg-[var(--gray-50)] text-[var(--text-body)]",
                )}
              >
                <Icon className="mr-1.5 size-4 shrink-0" />
                <span className="min-w-0 leading-tight">{page.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PreviewPage({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-[opacity,transform] duration-[var(--dur-slow)] ease-[var(--ease-standard)]",
        active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      {children}
    </div>
  );
}

function DocumentCover() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-md)]">
      <div className="bg-[linear-gradient(135deg,var(--blue-600),var(--blue-500))] p-6 text-white sm:p-7">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white/90">
          <ShieldCheck className="size-3.5" /> Dokument RODO
        </div>
        <div className="mt-3 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
          Polityka
          <br />
          prywatności
        </div>
        <div className="mt-3 text-xs text-white/85">[Nazwa Twojej firmy] · [NIP]</div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-7">
        <SkeletonLine width="88%" tone="strong" />
        <SkeletonLine width="96%" />
        <SkeletonLine width="70%" />
        <SkeletonLine width="42%" tone="brand" className="mt-2" />
        <SkeletonLine width="92%" />
        <SkeletonLine width="80%" />
        <div className="mt-auto flex items-center justify-between border-t border-[var(--gray-100)] pt-4">
          <SkeletonLine width="84px" tone="strong" size="sm" />
          <span className="font-mono text-[10px] text-[var(--text-faint)]">str. 1</span>
        </div>
      </div>
    </div>
  );
}

function DocumentContent() {
  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-md)] sm:gap-4 sm:p-7">
      <div className="font-mono text-[10px] text-[var(--text-faint)]">Polityka prywatności - str. 3</div>
      <DocumentHeading>§3. Cele i podstawy przetwarzania</DocumentHeading>
      <SkeletonLine width="94%" />
      <SkeletonLine width="88%" />
      <DocumentHeading className="mt-2">§4. Okres przechowywania danych</DocumentHeading>
      <SkeletonLine width="90%" />
      <SkeletonLine width="76%" />
      <SkeletonLine width="84%" />
      <DocumentHeading className="mt-2">§5. Prawa osób, których dane dotyczą</DocumentHeading>
      <SkeletonLine width="92%" />
    </div>
  );
}

function DocumentCookies() {
  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-md)] sm:p-7">
      <div className="font-mono text-[10px] text-[var(--text-faint)]">Polityka prywatności - str. 8</div>
      <DocumentHeading>§9. Pliki cookies i analityka</DocumentHeading>
      <SkeletonLine width="90%" />
      <div className="mt-1 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--gray-200)]">
        <div className="flex gap-3 bg-[var(--gray-50)] px-3 py-2">
          <SkeletonLine width="44%" tone="strong" size="sm" />
          <SkeletonLine width="32%" tone="strong" size="sm" />
        </div>
        <div className="flex gap-3 border-t border-[var(--gray-100)] px-3 py-2">
          <SkeletonLine width="48%" size="sm" />
          <SkeletonLine width="24%" size="sm" />
        </div>
        <div className="flex gap-3 border-t border-[var(--gray-100)] px-3 py-2">
          <SkeletonLine width="38%" size="sm" />
          <SkeletonLine width="34%" size="sm" />
        </div>
      </div>
      <SkeletonLine width="82%" />
    </div>
  );
}

function DocumentHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("font-display text-sm font-bold text-[var(--text-strong)] sm:text-base", className)}>{children}</div>;
}

function SkeletonLine({
  className,
  size = "md",
  tone = "muted",
  width,
}: {
  className?: string;
  size?: "sm" | "md";
  tone?: "muted" | "strong" | "brand";
  width: string;
}) {
  return (
    <div
      className={cn(
        "rounded-full",
        size === "sm" ? "h-2" : "h-2.5",
        tone === "brand" && "bg-[var(--blue-200)]",
        tone === "muted" && "bg-[var(--gray-100)]",
        tone === "strong" && "bg-[var(--gray-200)]",
        className,
      )}
      style={{ width }}
    />
  );
}

function BuyPanel({
  added,
  onAdd,
  onScrollToContent,
}: {
  added: boolean;
  onAdd: () => void;
  onScrollToContent: () => void;
}) {
  return (
    <div className="min-w-0 pt-1">
      <Badge tone="brand">
        <Sparkles className="size-3.5" />
        {privacyPolicyProduct.category}
      </Badge>
      <h1 className="mt-4 text-[var(--fs-h1)] font-extrabold leading-tight tracking-normal text-[var(--text-strong)]">
        {privacyPolicyProduct.shortName}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--text-body)]">{privacyPolicyProduct.lead}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <HeroChip icon={ShieldCheck}>Zgodne z RODO</HeroChip>
        <HeroChip icon={Scale}>Tworzone przez prawników</HeroChip>
        <HeroChip icon={RefreshCw}>Aktualizacje przepisów</HeroChip>
      </div>

      <div className="mt-7 border-t border-[var(--border-subtle)] pt-7">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-[2.75rem] font-extrabold leading-none text-[var(--text-strong)]">
            {privacyPolicyProduct.price} zł
          </span>
          <span className="font-semibold text-[var(--text-muted)]">jednorazowo</span>
        </div>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{privacyPolicyProduct.priceNote}</p>

        <div className="mt-5 grid max-w-[440px] gap-3">
          <Button type="button" size="lg" className="w-full" onClick={onAdd}>
            {added ? "W koszyku" : "Dodaj do koszyka"} <ShoppingCart className="size-5" />
          </Button>
          <Button type="button" size="lg" variant="soft" className="w-full" onClick={onScrollToContent}>
            Zobacz, co zawiera <ArrowRight className="size-5" />
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-body)]">
          <Shield className="size-4 text-[var(--success)]" />
          <strong>{privacyPolicyProduct.guarantee}</strong>
        </div>

        <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5">
          <div className="text-sm font-bold text-[var(--brand-ink)]">W zestawie:</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {productBundleItems.map((item, index) => {
              const Icon = bundleIcons[index] ?? FileText;

              return (
                <span key={item} className="inline-flex items-center gap-2 text-sm text-[var(--text-body)]">
                  <Icon className="size-4 shrink-0 text-[var(--brand)]" />
                  {item}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Lock className="size-3.5 shrink-0" />
          {privacyPolicyProduct.paymentNote}
        </div>
      </div>
    </div>
  );
}

function HeroChip({ children, icon: Icon }: { children: React.ReactNode; icon: LucideIcon }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm font-medium text-[var(--text-body)] shadow-[var(--shadow-xs)]">
      <Icon className="size-4 text-[var(--brand)]" />
      {children}
    </span>
  );
}

function TrustStrip() {
  return (
    <section className="border-b border-[var(--border-subtle)] bg-white">
      <div className="grid gap-5 py-6 sm:grid-cols-2 min-[921px]:grid-cols-4 pvz-container">
        {productTrustItems.map((item, index) => {
          const Icon = trustIcons[index] ?? ShieldCheck;

          return (
            <div key={item.title} className="flex min-w-0 items-center gap-3">
              <Icon className="size-5 shrink-0 text-[var(--brand)]" />
              <div className="min-w-0">
                <div className="text-sm font-bold text-[var(--text-strong)]">{item.title}</div>
                <div className="text-xs text-[var(--text-muted)]">{item.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ContentSection() {
  return (
    <section id="zawartosc" className="bg-[var(--surface-page)] pvz-section scroll-mt-24">
      <div className="pvz-container">
        <SectionHead
          eyebrow="Zawartość"
          title="Co dokładnie otrzymujesz"
          sub="Kompletna polityka prywatności z elementami wymaganymi przez RODO. Każda sekcja jest dopasowana do profilu Twojej działalności."
        />
        <Card className="mt-9" padding="lg">
          <div className="grid gap-x-10 gap-y-5 min-[721px]:grid-cols-2">
            {productContentItems.map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Check className="size-4" />
                </span>
                <p className="text-base leading-7 text-[var(--text-body)]">
                  <strong className="text-[var(--text-strong)]">{item.title}</strong> {item.text}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

function StepsSection() {
  return (
    <section className="bg-white pvz-section">
      <div className="pvz-container">
        <SectionHead eyebrow="Jak to działa" title="Gotowy dokument w trzech krokach" center />
        <div className="mt-12 grid gap-6 min-[921px]:grid-cols-3">
          {productSteps.map((step, index) => {
            const Icon = stepIcons[index] ?? BadgeCheck;

            return (
              <Card key={step.title} as="article" className="relative" padding="lg">
                <span className="absolute right-7 top-5 font-display text-4xl font-extrabold text-[var(--blue-100)]">
                  {index + 1}
                </span>
                <span className="mb-5 grid size-[52px] place-items-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon className="size-6" />
                </span>
                <h3 className="text-xl font-bold text-[var(--text-strong)]">{step.title}</h3>
                <p className="mt-2 text-base leading-7 text-[var(--text-muted)]">{step.text}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="bg-[var(--surface-page)] pvz-section">
      <div className="mx-auto w-full max-w-[980px] px-[var(--gutter)]">
        <SectionHead eyebrow="Porównanie" title="Dlaczego nie darmowy szablon?" center />

        <div className="mt-10 hidden overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-white shadow-[var(--shadow-md)] min-[721px]:block">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] text-sm">
            <CompareHeader />
            {productComparisonRows.map((row) => (
              <CompareRow key={row.label} row={row} />
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 min-[721px]:hidden">
          {productComparisonRows.map((row) => (
            <Card key={row.label} padding="md">
              <div className="font-bold text-[var(--text-strong)]">{row.label}</div>
              <div className="mt-4 grid gap-3 text-sm">
                <MobileCompareValue label="privazy." value={row.privazy} highlighted />
                <MobileCompareValue label="Darmowy szablon" value={row.template} />
                <MobileCompareValue label="Prawnik" value={row.lawyer} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompareHeader() {
  const cellClass = "border-b border-[var(--border-subtle)] px-4 py-5 text-center";

  return (
    <>
      <div className="border-b border-[var(--border-subtle)] px-5 py-5" />
      <div className={cn(cellClass, "border-x border-[var(--brand-border)] bg-[var(--brand-soft)]")}>
        <div className="font-display text-lg font-extrabold text-[var(--brand-ink)]">privazy.</div>
        <div className="mt-0.5 text-xs text-[var(--brand-ink)]/75">ten dokument</div>
      </div>
      <div className={cn(cellClass, "font-display font-bold text-[var(--text-muted)]")}>Darmowy szablon</div>
      <div className={cn(cellClass, "font-display font-bold text-[var(--text-muted)]")}>Prawnik</div>
    </>
  );
}

function CompareRow({ row }: { row: (typeof productComparisonRows)[number] }) {
  return (
    <>
      <div className="border-b border-[var(--border-subtle)] px-5 py-4 font-semibold text-[var(--text-strong)] last:border-b-0">
        {row.label}
      </div>
      <div className="grid place-items-center border-x border-b border-[var(--brand-border)] bg-[var(--brand-soft)] px-4 py-4 font-bold text-[var(--text-strong)]">
        <CompareValue value={row.privazy} />
      </div>
      <div className="grid place-items-center border-b border-[var(--border-subtle)] px-4 py-4 text-center text-[var(--text-muted)]">
        <CompareValue value={row.template} />
      </div>
      <div className="grid place-items-center border-b border-[var(--border-subtle)] px-4 py-4 text-center text-[var(--text-muted)]">
        <CompareValue value={row.lawyer} />
      </div>
    </>
  );
}

function MobileCompareValue({ highlighted, label, value }: { highlighted?: boolean; label: string; value: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 rounded-[var(--radius-md)] px-3 py-2", highlighted ? "bg-[var(--brand-soft)]" : "bg-[var(--gray-50)]")}>
      <span className={cn("font-semibold", highlighted ? "text-[var(--brand-ink)]" : "text-[var(--text-body)]")}>{label}</span>
      <CompareValue value={value} showText />
    </div>
  );
}

function CompareValue({ showText, value }: { showText?: boolean; value: string }) {
  if (value === "tak") {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--success)]">
        <Check className="size-5" />
        {showText && "tak"}
      </span>
    );
  }

  if (value === "nie") {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-faint)]">
        <X className="size-5" />
        {showText && "nie"}
      </span>
    );
  }

  if (value === "ryzyko") {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--warning)]">
        <AlertTriangle className="size-5" />
        {showText && "ryzyko"}
      </span>
    );
  }

  return <span className="font-semibold">{value}</span>;
}

function FaqSection({
  onChange,
  openFaq,
}: {
  onChange: (index: number) => void;
  openFaq: number;
}) {
  return (
    <section className="bg-white pvz-section">
      <div className="mx-auto w-full max-w-[820px] px-[var(--gutter)]">
        <SectionHead eyebrow="FAQ" title="Najczęstsze pytania" center />
        <div className="mt-10 space-y-3">
          {productFaqItems.map((item, index) => {
            const isOpen = openFaq === index;
            const answerId = `product-faq-${index}`;

            return (
              <article
                key={item.question}
                className={cn(
                  "overflow-hidden rounded-[var(--radius-lg)] border bg-white transition-shadow",
                  isOpen ? "border-[var(--brand-border)] shadow-[var(--shadow-md)]" : "border-[var(--border-subtle)] shadow-[var(--shadow-xs)]",
                )}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  className="flex w-full items-center justify-between gap-4 bg-transparent px-5 py-4 text-left"
                  onClick={() => onChange(isOpen ? -1 : index)}
                >
                  <span className="font-display text-base font-semibold text-[var(--text-strong)] sm:text-[17px]">
                    {item.question}
                  </span>
                  <ChevronDown className={cn("size-5 shrink-0 text-[var(--brand)] transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <p id={answerId} className="px-5 pb-5 text-base leading-7 text-[var(--text-body)]">
                    {item.answer}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SeoProse() {
  return (
    <section className="bg-[var(--surface-page)] pvz-section">
      <article className="mx-auto w-full max-w-[760px] px-[var(--gutter)]">
        <span className="text-[var(--fs-eyebrow)] font-semibold uppercase tracking-[var(--ls-wide)] text-[var(--brand-ink)]">
          Dowiedz się więcej
        </span>
        <h2 className="mt-3 text-[var(--fs-h2)] font-bold leading-tight text-[var(--text-strong)]">
          Polityka prywatności RODO - co warto wiedzieć
        </h2>
        <ProseBlock title="Czym jest polityka prywatności?">
          Polityka prywatności to dokument, w którym administrator danych informuje, jakie dane osobowe zbiera, w jakim celu, na
          jakiej podstawie prawnej oraz jak długo je przechowuje. Stanowi realizację obowiązku informacyjnego wynikającego z art.
          13 i 14 RODO i jest podstawą transparentności wobec klientów oraz użytkowników strony.
        </ProseBlock>
        <ProseBlock title="Kto musi posiadać politykę prywatności?">
          W praktyce dokument jest potrzebny każdej firmie i organizacji, która przetwarza dane osobowe: prowadzi sklep
          internetowy, newsletter, formularz kontaktowy, rekrutację czy obsługę klienta. Dotyczy to zarówno jednoosobowych
          działalności, jak i większych przedsiębiorstw.
        </ProseBlock>
        <ProseBlock title="Co powinna zawierać polityka zgodna z RODO?">
          Poprawna polityka prywatności wskazuje tożsamość administratora, cele i podstawy przetwarzania, kategorie danych,
          odbiorców, okresy retencji oraz prawa osób, których dane dotyczą. Powinna też opisywać wykorzystanie plików cookies i
          narzędzi analitycznych.
        </ProseBlock>
        <div className="mt-7 flex gap-3 rounded-[var(--radius-md)] bg-[var(--gray-100)] p-4 text-sm leading-6 text-[var(--text-muted)]">
          <Info className="mt-0.5 size-4 shrink-0 text-[var(--brand)]" />
          <p>Treści mają charakter ogólny i nie stanowią porady prawnej dla konkretnej sprawy.</p>
        </div>
      </article>
    </section>
  );
}

function ProseBlock({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <>
      <h3 className="mt-8 text-[var(--fs-h4)] font-bold text-[var(--text-strong)]">{title}</h3>
      <p className="mt-3 text-base leading-8 text-[var(--text-body)]">{children}</p>
    </>
  );
}

function CtaBand({ added, onAdd }: { added: boolean; onAdd: () => void }) {
  return (
    <section className="bg-[var(--surface-page)] pb-[var(--section-y)]">
      <div className="pvz-container">
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[linear-gradient(135deg,var(--blue-600),var(--blue-500))] px-6 py-12 text-center text-white shadow-[var(--shadow-brand)] sm:px-10 sm:py-16">
          <h2 className="text-[var(--fs-h2)] font-bold leading-tight text-white">
            Wdroż politykę prywatności już dziś
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-white/90">
            Dopasowany dokument, gotowy do pobrania w kilka minut. Z 14-dniową gwarancją zwrotu pieniędzy.
          </p>
          <div className="mx-auto mt-7 max-w-sm">
            <Button type="button" size="lg" variant="soft" className="w-full" onClick={onAdd}>
              {added ? "Dodano do koszyka" : "Dodaj do koszyka"} - {privacyPolicyProduct.price} zł
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductFooter() {
  return (
    <footer className="bg-[var(--gray-900)] text-white/70">
      <div className="grid gap-10 py-14 min-[721px]:grid-cols-2 min-[921px]:grid-cols-[1.4fr_1fr_1fr_1fr] pvz-container">
        <div>
          <Logo tone="inverse" />
          <p className="mt-4 max-w-xs text-sm leading-6">
            Polski legaltech do ochrony danych osobowych. Dokumenty RODO uszyte na miarę Twojej firmy.
          </p>
          <a href="mailto:kontakt@privazy.pl" className="mt-4 inline-block text-sm font-semibold text-[var(--blue-300)] transition hover:text-white">
            kontakt@privazy.pl
          </a>
        </div>
        <FooterColumn
          title="Produkt"
          links={[
            { label: "Dokumenty", href: "/#dokumenty" },
            { label: "Checker IOD", href: "/#checker" },
            { label: "Pakiety", href: "/#cennik" },
          ]}
        />
        <FooterColumn
          title="Firma"
          links={[
            { label: "O nas", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: "Kontakt", href: "mailto:kontakt@privazy.pl" },
          ]}
        />
        <FooterColumn
          title="Prawne"
          links={[
            { label: "Regulamin", href: "/" },
            { label: "Polityka prywatności", href: privacyPolicyProduct.canonicalPath },
          ]}
        />
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

function FooterColumn({ links, title }: { links: Array<{ href: string; label: string }>; title: string }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold uppercase text-white">{title}</h3>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
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
  );
}

function StickyBuyBar({ added, onAdd, show }: { added: boolean; onAdd: () => void; show: boolean }) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-subtle)] bg-[var(--glass-bg)] shadow-[0_-8px_30px_rgba(16,40,80,0.10)] backdrop-blur-md transition-transform duration-[var(--dur-base)]",
        show ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto flex min-h-[72px] w-full max-w-[var(--container)] items-center gap-3 px-[var(--gutter)] py-3">
        <span className="hidden size-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)] sm:grid">
          <Shield className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-bold text-[var(--text-strong)] sm:text-base">
            {privacyPolicyProduct.shortName}
          </div>
          <div className="truncate text-xs text-[var(--text-muted)]">Dopasowana do firmy · .docx + PDF + HTML</div>
        </div>
        <div className="hidden items-baseline gap-1 sm:flex">
          <span className="font-display text-xl font-extrabold text-[var(--text-strong)]">{privacyPolicyProduct.price} zł</span>
          <span className="text-xs text-[var(--text-muted)]">netto</span>
        </div>
        <Button type="button" size="sm" onClick={onAdd}>
          {added ? "W koszyku" : "Dodaj"}
        </Button>
      </div>
    </div>
  );
}

function SectionHead({
  center,
  eyebrow,
  sub,
  title,
}: {
  center?: boolean;
  eyebrow?: string;
  sub?: string;
  title: string;
}) {
  return (
    <div className={cn("max-w-[680px]", center && "mx-auto text-center")}>
      {eyebrow && (
        <span className="text-[var(--fs-eyebrow)] font-semibold uppercase tracking-[var(--ls-wide)] text-[var(--brand-ink)]">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-[var(--fs-h2)] font-bold leading-tight text-[var(--text-strong)]">{title}</h2>
      {sub && <p className="mt-4 text-lg leading-8 text-[var(--text-body)]">{sub}</p>}
    </div>
  );
}
