# Invoice Security

## Uprawnienia

| Rola | Odczyt | Issue mock |
| --- | --- | --- |
| `ADMIN` / `LAWYER` / `OPERATOR` | Wszystkie faktury operacyjne. | Tak. |
| `READ_ONLY` | Wszystkie faktury operacyjne. | Nie. |
| `CLIENT` | Order przypisany do usera lub jego `ClientProfile.organizationId`. | Tak, tylko własny paid order. |
| Brak sesji | Nie. | Nie. |

Autoryzacja odbywa się w każdym Route Handlerze i ponownie w serwisie. Nie
polega wyłącznie na proxy/middleware.

## Integralność

- cena, VAT, rabat i brutto są kopiowane z `Order`,
- buyer data pochodzi z `BillingProfile`,
- wymagane są zgodne `Order.PAID`, `paymentStatus=SUCCEEDED` i Payment,
- klient nie przesyła statusu ani kwot,
- `orderId` jest unikalny,
- provider blokuje live mode,
- response nie zawiera provider payloadu,
- tabela nie jest wystawiona do Data API.
