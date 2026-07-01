import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, BadgeCheck, Check, CreditCard, FileText, ReceiptText, ShieldCheck, ShoppingCart } from "lucide-react";

import { AddToCartButton } from "@/components/shop/shop-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { formatMoney, formatNetGross } from "@/lib/shop/money";
import type { PublicOrderView } from "@/lib/shop/types";
import type { ShopProduct } from "@/server/shop/catalog";

export function ShopHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-md">
      <div className="mx-auto flex h-[68px] w-full max-w-[var(--container)] items-center gap-4 px-[var(--gutter)]">
        <Link href={"/" as Route} aria-label="PRIVAZY strona glowna" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden flex-1 items-center gap-6 text-sm font-semibold text-[var(--text-body)] min-[721px]:flex">
          <Link href={"/sklep" as Route} className="hover:text-[var(--brand-ink)]">Sklep</Link>
          <Link href={"/sklep/pakiety" as Route} className="hover:text-[var(--brand-ink)]">Pakiety</Link>
          <Link href={"/blog" as Route} className="hover:text-[var(--brand-ink)]">Blog</Link>
        </nav>
        <Button asChild variant="outline" size="sm" className="ml-auto">
          <Link href={"/koszyk" as Route}>
            <ShoppingCart className="size-4" />
            Koszyk
          </Link>
        </Button>
      </div>
    </header>
  );
}

export function ShopFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-white">
      <div className="flex flex-col gap-3 py-8 text-sm text-[var(--text-muted)] pvz-container min-[721px]:flex-row min-[721px]:items-center min-[721px]:justify-between">
        <Logo />
        <p>Dokumenty i pakiety PRIVAZY. Tresci nie stanowia indywidualnej porady prawnej.</p>
      </div>
    </footer>
  );
}

export function ShopShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-strong)] pvz-bleed-safe">
      <ShopHeader />
      {children}
      <ShopFooter />
    </main>
  );
}

export function ShopCatalogPage({
  eyebrow = "Sklep",
  products,
  title = "Dokumenty RODO i pakiety wdrozeniowe",
}: {
  eyebrow?: string;
  products: ShopProduct[];
  title?: string;
}) {
  const documentProducts = products.filter((product) => product.productType !== "PACKAGE");
  const packages = products.filter((product) => product.productType === "PACKAGE");

  return (
    <ShopShell>
      <section className="border-b border-[var(--border-subtle)] bg-white py-10 min-[921px]:py-14">
        <div className="grid gap-5 pvz-container">
          <Badge tone="brand">{eyebrow}</Badge>
          <div className="grid gap-4 min-[921px]:grid-cols-[1fr_360px] min-[921px]:items-end">
            <div>
              <h1 className="text-[var(--fs-h1)] font-bold">{title}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--text-body)]">
                Wybierz pojedynczy dokument albo pakiet. Ceny, VAT i dostepnosc sa finalnie liczone po stronie serwera.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4 text-sm leading-6 text-[var(--brand-ink)]">
              Po platnosci status zamowienia prowadzi do formularzy danych. W Phase 6 te formularze zasilaja generatory dokumentow.
            </div>
          </div>
        </div>
      </section>

      {documentProducts.length > 0 && (
        <ProductGridSection eyebrow="Dokumenty" products={documentProducts} title="Dokumenty pojedyncze" />
      )}
      {packages.length > 0 && (
        <ProductGridSection eyebrow="Pakiety" products={packages} title="Pakiety dla firm" white />
      )}
    </ShopShell>
  );
}

export function ProductGridSection({
  eyebrow,
  products,
  title,
  white,
}: {
  eyebrow: string;
  products: ShopProduct[];
  title: string;
  white?: boolean;
}) {
  return (
    <section className={white ? "bg-white pvz-section" : "bg-[var(--surface-page)] pvz-section"}>
      <div className="pvz-container">
        <span className="text-[var(--fs-eyebrow)] font-semibold uppercase tracking-[var(--ls-wide)] text-[var(--brand-ink)]">{eyebrow}</span>
        <h2 className="mt-3 text-[var(--fs-h2)] font-bold">{title}</h2>
        <div className="mt-8 grid gap-5 min-[721px]:grid-cols-2 min-[1180px]:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductCard({ product }: { product: ShopProduct }) {
  const price = formatNetGross(product.priceNetCents, product.vatRateBps);

  return (
    <Card as="article" padding="lg" className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <Badge tone={product.productType === "PACKAGE" ? "success" : "brand"}>{product.productType === "PACKAGE" ? "Pakiet" : "Dokument"}</Badge>
        <span className="text-xs font-semibold text-[var(--text-muted)]">{product.expectedDelivery}</span>
      </div>
      <h3 className="mt-5 font-display text-xl font-bold text-[var(--text-strong)]">{product.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--text-body)]">{product.shortDescription}</p>
      <div className="mt-5">
        <div className="font-display text-2xl font-extrabold text-[var(--text-strong)]">{price.gross}</div>
        <div className="text-xs font-semibold text-[var(--text-muted)]">{price.net} netto, {price.vat}</div>
      </div>
      <div className="mt-auto grid gap-3 pt-6">
        <AddToCartButton productSlug={product.slug} className="w-full" />
        <Button asChild variant="soft" className="w-full">
          <Link href={`/sklep/${product.slug}` as Route}>
            Szczegoly <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export function ShopProductDetail({ product }: { product: ShopProduct }) {
  const price = formatNetGross(product.priceNetCents, product.vatRateBps);
  const includedFiles = toStringArray(product.includedFiles);

  return (
    <ShopShell>
      <section className="border-b border-[var(--border-subtle)] bg-white py-10 min-[921px]:py-16">
        <div className="grid gap-10 pvz-container min-[921px]:grid-cols-[0.92fr_1.08fr] min-[921px]:items-start">
          <div className="rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--gray-50)] p-5 shadow-[var(--shadow-lg)]">
            <div className="rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--brand-ink)]">
                <FileText className="size-5" />
                Podglad zakresu produktu
              </div>
              <div className="mt-8 grid gap-3">
                {includedFiles.slice(0, 5).map((file) => (
                  <div key={file} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] px-4 py-3 text-sm font-semibold text-[var(--text-body)]">
                    <Check className="size-4 shrink-0 text-[var(--success)]" />
                    {file}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <Badge tone={product.productType === "PACKAGE" ? "success" : "brand"}>{product.productType === "PACKAGE" ? "Pakiet" : "Dokument"}</Badge>
            <h1 className="mt-4 text-[var(--fs-h1)] font-bold">{product.name}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--text-body)]">{product.description}</p>
            <div className="mt-6 grid gap-3 min-[721px]:grid-cols-3">
              <ProductFact icon={<ShieldCheck />} label="RODO" value="Zakres zgodnosci" />
              <ProductFact icon={<CreditCard />} label={product.expectedDelivery} value="Dostep po platnosci" />
              <ProductFact icon={<ReceiptText />} label="Faktura" value="Automatyczna po oplaceniu" />
            </div>
            <div className="mt-7 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white p-5 shadow-[var(--shadow-sm)]">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-4xl font-extrabold text-[var(--text-strong)]">{price.gross}</span>
                <span className="text-sm font-semibold text-[var(--text-muted)]">brutto</span>
              </div>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{price.net} netto, {price.vat}</p>
              <div className="mt-5 grid gap-3 min-[520px]:grid-cols-2">
                <AddToCartButton productSlug={product.slug} size="lg" className="w-full" />
                <Button asChild size="lg" variant="soft" className="w-full">
                  <Link href={"/koszyk" as Route}>
                    Przejdz do koszyka <ArrowRight className="size-5" />
                  </Link>
                </Button>
              </div>
              <p className="mt-4 text-xs leading-5 text-[var(--text-muted)]">{product.legalDisclaimer}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface-page)] pvz-section">
        <div className="grid gap-8 pvz-container min-[921px]:grid-cols-[1fr_360px]">
          <div>
            <span className="text-[var(--fs-eyebrow)] font-semibold uppercase tracking-[var(--ls-wide)] text-[var(--brand-ink)]">Zakres</span>
            <h2 className="mt-3 text-[var(--fs-h2)] font-bold">Co obejmuje zakup</h2>
            <div className="mt-6 grid gap-3">
              {includedFiles.map((file) => (
                <div key={file} className="flex gap-3 rounded-[var(--radius-md)] bg-white p-4 shadow-[var(--shadow-xs)]">
                  <BadgeCheck className="mt-0.5 size-5 shrink-0 text-[var(--brand)]" />
                  <span className="text-sm leading-6 text-[var(--text-body)]">{file}</span>
                </div>
              ))}
            </div>
          </div>
          <Card padding="lg" variant="soft">
            <h3 className="font-display text-xl font-bold">Proces po zakupie</h3>
            <ol className="mt-5 grid gap-4 text-sm leading-6 text-[var(--brand-ink)]">
              <li>1. Oplacasz zamowienie przez skonfigurowanego dostawce platnosci.</li>
              <li>2. System tworzy fakture i status publiczny zabezpieczony tokenem.</li>
              <li>3. Pozycje zamowienia czekaja na formularze danych do dokumentow.</li>
            </ol>
          </Card>
        </div>
      </section>
    </ShopShell>
  );
}

export function OrderStatusView({ order }: { order: PublicOrderView }) {
  return (
    <ShopShell>
      <section className="bg-[var(--surface-page)] py-10 min-[921px]:py-14">
        <div className="grid gap-8 pvz-container min-[921px]:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <Badge tone={order.status === "PAID" ? "success" : order.status === "PAYMENT_FAILED" ? "danger" : "warning"} dot>
              {statusLabel(order.status)}
            </Badge>
            <h1 className="mt-4 text-[var(--fs-h1)] font-bold">Zamowienie {order.orderNumber}</h1>
            <p className="mt-3 text-base leading-7 text-[var(--text-body)]">Tutaj widzisz status platnosci, faktury i produktow. Link jest publiczny, ale wymaga unikalnego tokenu z maila.</p>

            <div className="mt-8 grid gap-4">
              {order.items.map((item) => (
                <article key={`${item.productSlug}-${item.productName}`} className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white p-5 shadow-[var(--shadow-sm)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-lg font-bold">{item.productName}</h2>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">Liczba: {item.quantity}</p>
                    </div>
                    <Badge tone={item.status === "INPUT_REQUIRED" ? "brand" : "neutral"}>{itemStatusLabel(item.status)}</Badge>
                  </div>
                  {item.inputFormPath && (
                    <Button asChild variant="soft" className="mt-4">
                      <Link href={item.inputFormPath as Route}>Formularz danych</Link>
                    </Button>
                  )}
                </article>
              ))}
            </div>
          </div>
          <aside className="h-fit rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white p-5 shadow-[var(--shadow-sm)]">
            <h2 className="font-display text-xl font-bold">Podsumowanie</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <SummaryRow label="Netto" value={formatMoney(order.subtotalNetCents, order.currency)} />
              <SummaryRow label="VAT" value={formatMoney(order.vatCents, order.currency)} />
              {order.discountCents > 0 && <SummaryRow label="Rabat" value={`-${formatMoney(order.discountCents, order.currency)}`} />}
              <div className="border-t border-[var(--border-subtle)] pt-3">
                <SummaryRow strong label="Razem" value={formatMoney(order.totalGrossCents, order.currency)} />
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--border-subtle)] pt-5">
              <h3 className="text-sm font-bold text-[var(--text-strong)]">Platnosci</h3>
              <div className="mt-3 grid gap-2">
                {order.payments.map((payment, index) => (
                  <div key={`${payment.status}-${index}`} className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--gray-50)] px-3 py-2 text-sm">
                    <span>{paymentStatusLabel(payment.status)}</span>
                    <span className="font-semibold">{formatMoney(payment.amountGrossCents, order.currency)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--border-subtle)] pt-5">
              <h3 className="text-sm font-bold text-[var(--text-strong)]">Faktury</h3>
              {order.invoices.length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {order.invoices.map((invoice) => (
                    <div key={invoice.invoiceNumber} className="rounded-[var(--radius-md)] bg-[var(--gray-50)] px-3 py-2 text-sm">
                      <div className="font-semibold">{invoice.invoiceNumber}</div>
                      <div className="text-[var(--text-muted)]">{invoice.status}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Faktura pojawi sie po potwierdzeniu platnosci.</p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </ShopShell>
  );
}

function ProductFact({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white p-4 shadow-[var(--shadow-xs)]">
      <span className="text-[var(--brand)] [&_svg]:size-5">{icon}</span>
      <div className="mt-2 text-sm font-bold text-[var(--text-strong)]">{label}</div>
      <div className="text-xs text-[var(--text-muted)]">{value}</div>
    </div>
  );
}

function SummaryRow({ label, strong, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <div className={strong ? "flex justify-between gap-4 text-base font-extrabold" : "flex justify-between gap-4 text-[var(--text-body)]"}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    CANCELLED: "Anulowane",
    COMPLETED: "Zakonczone",
    FULFILLING: "W realizacji",
    PAID: "Oplacone",
    PAYMENT_FAILED: "Platnosc nieudana",
    PENDING_PAYMENT: "Oczekuje na platnosc",
    REFUNDED: "Zwrocone",
  };

  return labels[status] ?? status;
}

function itemStatusLabel(status: string) {
  const labels: Record<string, string> = {
    CANCELLED: "Anulowane",
    FULFILLED: "Wydane",
    IN_PROGRESS: "W opracowaniu",
    INPUT_REQUIRED: "Wymaga danych",
    PENDING_PAYMENT: "Oczekuje na platnosc",
    READY: "Gotowe",
    REFUNDED: "Zwrocone",
  };

  return labels[status] ?? status;
}

function paymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    CANCELLED: "Anulowana",
    FAILED: "Nieudana",
    PAID: "Oplacona",
    PENDING: "Oczekuje",
    PROCESSING: "Przetwarzana",
    REFUNDED: "Zwrocona",
  };

  return labels[status] ?? status;
}
