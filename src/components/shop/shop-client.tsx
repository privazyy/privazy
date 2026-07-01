"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { ArrowRight, Check, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatMoney } from "@/lib/shop/money";
import type { CartView } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "soft" | "danger";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export function AddToCartButton({
  children = "Dodaj do koszyka",
  className,
  productSlug,
  size = "default",
  variant = "default",
}: {
  children?: React.ReactNode;
  className?: string;
  productSlug: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  const [state, setState] = useState<"idle" | "pending" | "added" | "error">("idle");

  async function addToCart() {
    setState("pending");

    try {
      const response = await fetch("/api/cart/items", {
        body: JSON.stringify({ productSlug, quantity: 1 }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Nie udalo sie dodac produktu.");
      }

      const cart = (await response.json()) as CartView;
      window.dispatchEvent(new CustomEvent("privazy-cart-updated", { detail: cart }));
      setState("added");
      window.setTimeout(() => setState("idle"), 2200);
    } catch (error) {
      console.error(error);
      setState("error");
      window.setTimeout(() => setState("idle"), 2600);
    }
  }

  return (
    <Button type="button" size={size} variant={variant} className={className} disabled={state === "pending"} onClick={addToCart}>
      {state === "pending" ? <Loader2 className="size-4 animate-spin" /> : state === "added" ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
      {state === "error" ? "Sprobuj ponownie" : state === "added" ? "W koszyku" : children}
    </Button>
  );
}

export function CartPageClient({ initialCart }: { initialCart: CartView }) {
  const [cart, setCart] = useState(initialCart);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateItem(itemId: string, quantity: number) {
    setPendingItemId(itemId);
    setError(null);

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        body: JSON.stringify({ quantity }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      const payload = (await response.json()) as CartView | { error?: string };
      if (!response.ok) throw new Error("error" in payload ? payload.error : "Nie udalo sie zaktualizowac koszyka.");

      setCart(payload as CartView);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Nie udalo sie zaktualizowac koszyka.");
    } finally {
      setPendingItemId(null);
    }
  }

  async function removeItem(itemId: string) {
    setPendingItemId(itemId);
    setError(null);

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
      const payload = (await response.json()) as CartView | { error?: string };
      if (!response.ok) throw new Error("error" in payload ? payload.error : "Nie udalo sie usunac pozycji.");

      setCart(payload as CartView);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Nie udalo sie usunac pozycji.");
    } finally {
      setPendingItemId(null);
    }
  }

  if (cart.itemCount === 0) {
    return (
      <section className="bg-[var(--surface-page)] pvz-section">
        <div className="mx-auto grid w-full max-w-[760px] gap-5 px-[var(--gutter)] text-center">
          <ShoppingCart className="mx-auto size-11 text-[var(--brand)]" />
          <h1 className="text-[var(--fs-h1)] font-bold">Koszyk jest pusty</h1>
          <p className="text-base leading-7 text-[var(--text-body)]">Wybierz dokument albo pakiet i wroc tutaj, zeby dokonczyc zakup.</p>
          <Button asChild className="mx-auto">
            <Link href={"/sklep" as Route}>Przejdz do sklepu</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[var(--surface-page)] py-10 min-[921px]:py-14">
      <div className="grid gap-8 pvz-container min-[921px]:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <h1 className="text-[var(--fs-h1)] font-bold">Koszyk</h1>
          {error && <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--danger-soft)] p-3 text-sm font-semibold text-[var(--red-600)]">{error}</p>}
          <div className="mt-6 grid gap-4">
            {cart.items.map((item) => {
              const isPending = pendingItemId === item.id;

              return (
                <article key={item.id} className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white p-5 shadow-[var(--shadow-sm)] min-[721px]:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <Link href={`/sklep/${item.productSlug}` as Route} className="font-display text-lg font-bold text-[var(--text-strong)] hover:text-[var(--brand-ink)]">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{item.shortDescription}</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--text-body)]">{item.expectedDelivery}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 min-[721px]:justify-end">
                    <QuantityControl
                      disabled={isPending}
                      quantity={item.quantity}
                      onDecrease={() => updateItem(item.id, item.quantity - 1)}
                      onIncrease={() => updateItem(item.id, item.quantity + 1)}
                    />
                    <div className="min-w-28 text-right">
                      <div className="font-display text-lg font-extrabold text-[var(--text-strong)]">{formatMoney(item.line.totalGrossCents, item.currency)}</div>
                      <div className="text-xs text-[var(--text-muted)]">brutto</div>
                    </div>
                    <Button type="button" size="icon" variant="ghost" disabled={isPending} aria-label="Usun z koszyka" onClick={() => removeItem(item.id)}>
                      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <OrderSummary cart={cart} />
      </div>
    </section>
  );
}

export function CheckoutForm({ cart }: { cart: CartView }) {
  const [customerType, setCustomerType] = useState<"PERSON" | "COMPANY">("COMPANY");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      addressLine1: String(form.get("addressLine1") ?? ""),
      addressLine2: String(form.get("addressLine2") ?? ""),
      city: String(form.get("city") ?? ""),
      companyName: String(form.get("companyName") ?? ""),
      country: String(form.get("country") ?? "PL"),
      customerType,
      email: String(form.get("email") ?? ""),
      name: String(form.get("name") ?? ""),
      nip: String(form.get("nip") ?? ""),
      phone: String(form.get("phone") ?? ""),
      postalCode: String(form.get("postalCode") ?? ""),
      consents: {
        contact: form.get("contact") === "on",
        privacy: form.get("privacy") === "on",
        terms: form.get("terms") === "on",
      },
    };

    try {
      const response = await fetch("/api/checkout/create", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as { error?: string; paymentUrl?: string };

      if (!response.ok || !result.paymentUrl) {
        throw new Error(result.error ?? "Nie udalo sie utworzyc zamowienia.");
      }

      window.location.assign(result.paymentUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Nie udalo sie utworzyc zamowienia.");
      setSubmitting(false);
    }
  }

  if (cart.itemCount === 0) {
    return (
      <div className="mx-auto grid w-full max-w-[760px] gap-5 px-[var(--gutter)] py-16 text-center">
        <h1 className="text-[var(--fs-h1)] font-bold">Nie ma czego oplacic</h1>
        <p className="text-base leading-7 text-[var(--text-body)]">Dodaj produkt do koszyka i wroc do checkoutu.</p>
        <Button asChild className="mx-auto">
          <Link href={"/sklep" as Route}>Przejdz do sklepu</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="bg-[var(--surface-page)] py-10 min-[921px]:py-14">
      <div className="grid gap-8 pvz-container min-[921px]:grid-cols-[1fr_360px]">
        <form className="grid gap-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white p-5 shadow-[var(--shadow-sm)] min-[721px]:p-7" onSubmit={submitCheckout}>
          <div>
            <h1 className="text-[var(--fs-h1)] font-bold">Dane do zamowienia</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Po platnosci otrzymasz link do statusu zamowienia i formularzy dokumentow.</p>
          </div>

          <Field label="Typ klienta" htmlFor="customerType" required>
            <Select id="customerType" name="customerType" value={customerType} onChange={(event) => setCustomerType(event.target.value as "PERSON" | "COMPANY")}>
              <option value="COMPANY">Firma</option>
              <option value="PERSON">Osoba prywatna</option>
            </Select>
          </Field>

          <div className="grid gap-4 min-[721px]:grid-cols-2">
            <Field label="Imie i nazwisko" htmlFor="name" required>
              <Input id="name" name="name" autoComplete="name" required />
            </Field>
            <Field label="E-mail" htmlFor="email" required>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
          </div>

          <div className="grid gap-4 min-[721px]:grid-cols-2">
            <Field label="Telefon" htmlFor="phone">
              <Input id="phone" name="phone" type="tel" autoComplete="tel" />
            </Field>
            {customerType === "COMPANY" && (
              <Field label="NIP" htmlFor="nip" required>
                <Input id="nip" name="nip" inputMode="numeric" required />
              </Field>
            )}
          </div>

          {customerType === "COMPANY" && (
            <Field label="Nazwa firmy" htmlFor="companyName" required>
              <Input id="companyName" name="companyName" autoComplete="organization" required />
            </Field>
          )}

          <div className="grid gap-4 min-[721px]:grid-cols-[1.2fr_0.8fr]">
            <Field label="Ulica i numer" htmlFor="addressLine1" required>
              <Input id="addressLine1" name="addressLine1" autoComplete="address-line1" required />
            </Field>
            <Field label="Lokal" htmlFor="addressLine2">
              <Input id="addressLine2" name="addressLine2" autoComplete="address-line2" />
            </Field>
          </div>

          <div className="grid gap-4 min-[721px]:grid-cols-[0.65fr_1fr_0.5fr]">
            <Field label="Kod pocztowy" htmlFor="postalCode" required>
              <Input id="postalCode" name="postalCode" autoComplete="postal-code" required />
            </Field>
            <Field label="Miejscowosc" htmlFor="city" required>
              <Input id="city" name="city" autoComplete="address-level2" required />
            </Field>
            <Field label="Kraj" htmlFor="country" required>
              <Input id="country" name="country" defaultValue="PL" required />
            </Field>
          </div>

          <div className="grid gap-3 rounded-[var(--radius-md)] bg-[var(--gray-50)] p-4 text-sm text-[var(--text-body)]">
            <Checkbox name="terms" required>Akceptuje regulamin sprzedazy dokumentow PRIVAZY.</Checkbox>
            <Checkbox name="privacy" required>Akceptuje polityke prywatnosci i przetwarzanie danych do realizacji zamowienia.</Checkbox>
            <Checkbox name="contact">Chce otrzymywac informacje o aktualizacjach dokumentow.</Checkbox>
          </div>

          {error && <p className="rounded-[var(--radius-md)] bg-[var(--danger-soft)] p-3 text-sm font-semibold text-[var(--red-600)]">{error}</p>}

          <Button type="submit" size="lg" disabled={submitting} className="w-full min-[721px]:w-auto">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}
            Przejdz do platnosci
          </Button>
        </form>
        <OrderSummary cart={cart} compact />
      </div>
    </section>
  );
}

function Checkbox({ children, name, required }: { children: React.ReactNode; name: string; required?: boolean }) {
  return (
    <label className="flex gap-3 leading-6">
      <input
        className="mt-1 size-4 shrink-0 rounded border-[var(--border-default)] accent-[var(--brand)]"
        name={name}
        required={required}
        type="checkbox"
      />
      <span>{children}</span>
    </label>
  );
}

function QuantityControl({
  disabled,
  onDecrease,
  onIncrease,
  quantity,
}: {
  disabled: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  quantity: number;
}) {
  return (
    <div className="grid grid-cols-[40px_44px_40px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white">
      <button type="button" className="grid h-10 place-items-center hover:bg-[var(--brand-soft)] disabled:opacity-50" disabled={disabled} onClick={onDecrease} aria-label="Zmniejsz liczbe sztuk">
        <Minus className="size-4" />
      </button>
      <span className="grid h-10 place-items-center border-x border-[var(--border-subtle)] text-sm font-bold">{quantity}</span>
      <button type="button" className="grid h-10 place-items-center hover:bg-[var(--brand-soft)] disabled:opacity-50" disabled={disabled || quantity >= 10} onClick={onIncrease} aria-label="Zwieksz liczbe sztuk">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function OrderSummary({ cart, compact }: { cart: CartView; compact?: boolean }) {
  return (
    <aside className={cn("h-fit rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white p-5 shadow-[var(--shadow-sm)]", compact && "min-[921px]:sticky min-[921px]:top-24")}>
      <h2 className="font-display text-xl font-bold">Podsumowanie</h2>
      <div className="mt-5 grid gap-3 text-sm">
        <SummaryRow label="Netto" value={formatMoney(cart.subtotalNetCents, cart.currency)} />
        <SummaryRow label="VAT" value={formatMoney(cart.vatCents, cart.currency)} />
        {cart.discountCents > 0 && <SummaryRow label="Rabat" value={`-${formatMoney(cart.discountCents, cart.currency)}`} />}
        <div className="mt-2 border-t border-[var(--border-subtle)] pt-4">
          <SummaryRow strong label="Do zaplaty" value={formatMoney(cart.totalGrossCents, cart.currency)} />
        </div>
      </div>
      {!compact && (
        <Button asChild size="lg" className="mt-6 w-full">
          <Link href={"/checkout" as Route}>
            Przejdz do checkoutu <ArrowRight className="size-5" />
          </Link>
        </Button>
      )}
      <p className="mt-4 text-xs leading-5 text-[var(--text-muted)]">Cena jest przeliczana po stronie serwera na podstawie aktywnego katalogu produktow.</p>
    </aside>
  );
}

function SummaryRow({ label, strong, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", strong ? "text-base font-extrabold text-[var(--text-strong)]" : "text-[var(--text-body)]")}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
