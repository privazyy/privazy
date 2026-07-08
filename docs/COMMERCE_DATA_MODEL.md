# Commerce Data Model

Wszystkie kwoty są integerami w minor units (groszach), a VAT w basis points
(`2300` = 23%).

| Model | Rola |
| --- | --- |
| `Product` | Serwerowe źródło ceny, VAT, waluty, statusu i opcjonalnego `documentTemplateId`. |
| `ProductVariant` | Opcjonalne warianty przyszłych produktów; nie są wymagane przez seed. |
| `Coupon` | Ograniczony fundament rabatów; brak publicznego pola manipulacji ceną. |
| `Cart` | Aktywny koszyk powiązany z hashem anonimowego tokenu. |
| `CartItem` | Snapshot ceny/VAT oraz produkt źródłowy. |
| `BillingProfile` | Snapshot danych rozliczeniowych i intencji faktury. |
| `Order` | Serwerowe totals, status zamówienia i osobny `paymentStatus`. |
| `OrderItem` | Snapshot produktu i fulfillment; opcjonalne powiązanie z template. |
| `Payment` | Idempotentna płatność MOCK/SANDBOX/LIVE; aktywny kod używa wyłącznie MOCK. |
| `PaymentEvent` | Idempotency key, hash payloadu, kwota/waluta i wynik przetworzenia. |
| `Invoice` | Jedna faktura mock na order; snapshot buyer data i totals. |
| `InvoiceEvent` | Hash eventu providera bez raw payloadu. |

Migracja jest addytywna. Włącza RLS, usuwa dostęp Data API dla
`PUBLIC`/`anon`/`authenticated`, dodaje indeksy FK/statusów oraz constraints
kwot, VAT i ilości. Nie została uruchomiona na produkcji.

Modele faktur są wyłącznie fundamentem MOCK/SANDBOX. Nie tworzą dokumentu
księgowego ani produkcyjnej numeracji.
