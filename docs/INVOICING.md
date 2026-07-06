# INVOICING

Faza 5 przygotowuje model i interfejs faktur bez integracji z zewnetrznym systemem fakturowym. Mock provider wystawia wewnetrzna fakture po potwierdzeniu platnosci.

## Pliki

- `src/server/invoices/invoice-provider.ts` - kontrakt providerow faktur.
- `src/server/invoices/mock-provider.ts` - implementacja testowa.
- `src/server/invoices/index.ts` - wybor providera.
- `prisma/schema.prisma` - model `Invoice`.

## Model Invoice

`Invoice` przechowuje:

- `orderId`
- `organizationId`
- provider i status,
- `invoiceNumber`,
- `externalInvoiceId` i `externalUrl` na przyszla integracje,
- `buyerSnapshot`,
- `itemsSnapshot`,
- kwoty netto, VAT i brutto,
- walute,
- date wystawienia.

Statusy:

- `DRAFT`
- `ISSUED`
- `FAILED`
- `CANCELLED`

Providerzy:

- `MOCK`
- `EXTERNAL`

## Mock invoice provider

Mock provider:

- pobiera zamowienie, profil fakturowy, organizacje i pozycje,
- nie tworzy duplikatu, jesli zamowienie ma juz fakture,
- nadaje numer `FV-MOCK/{year}/{orderNumber}`,
- zapisuje snapshot nabywcy i pozycji,
- ustawia status `ISSUED`,
- wysyla e-mail o fakturze, jesli Resend jest skonfigurowany.

Mock faktura nie jest dokumentem ksiegowym gotowym do produkcji. To wewnetrzny zapis techniczny i punkt integracyjny dla Fakturownia, inFakt, wFirma albo innego dostawcy.

## Dane nabywcy

Dane nabywcy pochodza z `BillingProfile`, ktory jest tworzony w checkoutcie. Dla firm wymagane sa:

- nazwa firmy,
- NIP,
- adres faktury,
- e-mail.

Dla osoby prywatnej zapisywane sa dane imienne i adresowe bez NIP.

## E-mail

Po wystawieniu mock faktury wysylany jest e-mail:

- temat: faktura do zamowienia,
- link do statusu zamowienia,
- brak publicznego pliku faktury, dopoki nie zostanie podlaczony realny provider.

## Env

```bash
INVOICE_PROVIDER=mock
RESEND_API_KEY=replace_in_private_env
RESEND_FROM=PRIVAZY <kontakt@privazy.pl>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Przed produkcja

- wybrac system fakturowania,
- zaimplementowac `InvoiceProviderClient`,
- zdecydowac, czy numeracje prowadzi PRIVAZY czy zewnetrzny provider,
- okreslic korekty, anulacje i zwroty,
- dodac link do PDF faktury z providera,
- zweryfikowac obowiazki podatkowe i format danych nabywcy,
- dodac testy integracyjne sandbox providera.
