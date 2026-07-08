# Invoice Data Model

## Invoice

`Invoice` jest unikalnie powiązana z `Order`. Przechowuje:

- provider/mode/status,
- mock invoice number i external ID,
- snapshot waluty, netto, VAT, rabatu i brutto,
- minimalny buyer snapshot z `BillingProfile`,
- opcjonalne pola przyszłego PDF/URL,
- timestamps oraz bezpieczny failure reason.

Kwoty są integerami w groszach. Constraint bazy wymaga:

```text
gross = net + vat - discount
```

## InvoiceEvent

`InvoiceEvent` zapisuje typ eventu, unikalne external ID oraz SHA-256
kanonicznych danych mock. Nie przechowuje raw payloadu.

Obie tabele mają RLS, cofnięte granty `PUBLIC`/`anon`/`authenticated`, indeksy
FK/statusów oraz pozostają dostępne tylko przez server-side Prisma.
