# Server-side Pricing

`src/server/commerce/pricing.ts` pobiera produkt z bazy i odrzuca:

- produkt brakujący, `DRAFT` albo `ARCHIVED`,
- walutę inną niż `PLN`,
- ilość poza `1..10`,
- cenę niepoprawną lub ujemny VAT.

Frontend nie wysyła ceny, VAT, totals ani statusu zamówienia. Cart zapisuje
snapshot wyliczeń, ale checkout nie ufa snapshotowi: ponownie czyta aktualny
produkt i liczy:

```text
lineNet = unitPriceNetCents * quantity
lineVat = round(lineNet * vatRateBps / 10000)
lineGross = lineNet + lineVat
```

`Order` i `OrderItem` zapisują wynik serwerowy. Constraints Postgresa stanowią
dodatkową obronę przed ujemnymi kwotami i nieprawidłową ilością.
