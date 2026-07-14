# PRIVAZY component showcase

This docs-only showcase replaces a public `/design-system` route until admin route protection is implemented.

## Buttons and fields

```tsx
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

<Field label="Adres e-mail" htmlFor="email" required hint="Uzyj adresu sluzbowego.">
  <Input id="email" type="email" placeholder="kontakt@firma.pl" />
</Field>

<Button>Sprawdz</Button>
<Button variant="outline">Anuluj</Button>
```

## Statuses and alerts

```tsx
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/status-badge";

<StatusBadge kind="processing">W toku</StatusBadge>

<Alert heading="Informacja prawna" tone="info">
  Material ma charakter ogolny i nie stanowi porady prawnej dla konkretnej sprawy.
</Alert>
```

## Modals and confirmations

```tsx
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Potwierdz wyslanie"
  description="Po wyslaniu sprawa trafi do historii organizacji."
  onConfirm={submit}
/>
```

## Tables

```tsx
import { DataTable } from "@/components/ui/data-table";

<DataTable
  columns={[
    { key: "name", header: "Nazwa", render: (row) => row.name },
    { key: "status", header: "Status", render: (row) => row.status },
  ]}
  getRowKey={(row) => row.id}
  rows={rows}
/>
```

`DataTable` ma kontrolowany poziomy scroll przez `pvz-h-scroll` i `data-responsive-scroll="true"`.

## Forms

```tsx
import { FormActions, FormSection, LegalDisclaimer } from "@/components/forms/form-patterns";
import { Button } from "@/components/ui/button";

<FormSection heading="Dane organizacji" description="Te dane trafia do dokumentu i CRM.">
  <LegalDisclaimer />
  <FormActions>
    <Button variant="outline">Wroc</Button>
    <Button>Przejdz dalej</Button>
  </FormActions>
</FormSection>
```

## Empty, loading and error states

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";

<LoadingState label="Ladowanie leadow" />
<EmptyState heading="Brak leadow" description="Nowe leady pojawia sie po wyslaniu formularza." />
<ErrorState />
```

## Timeline and comments

```tsx
import { CommentBox } from "@/components/ui/comment-box";
import { Timeline } from "@/components/ui/timeline";

<Timeline
  items={[
    { title: "Sprawa utworzona", description: "Wplynela przez checker IOD.", status: "new" },
    { title: "Przypisano opiekuna", meta: "Dzisiaj" },
  ]}
/>

<CommentBox helperText="Notatka bedzie widoczna w historii rekordu." />
```

## Checkout patterns

```tsx
import { CartSummary, CheckoutLayout, CheckoutStepIndicator, PriceBlock } from "@/components/shop/checkout-patterns";

<CheckoutLayout aside={<CartSummary total="479,70 zl" items={[{ label: "Polityka prywatnosci", value: "479,70 zl" }]} />}>
  <CheckoutStepIndicator current={2} />
  <PriceBlock gross="479,70 zl" net="390,00 zl netto" vat="VAT 23%" />
</CheckoutLayout>
```
