# Commerce Smoke Checklist

Repo nie ma runnera testów. Do czasu jego dodania należy wykonać:

| Scenariusz | Oczekiwany wynik |
| --- | --- |
| `DRAFT`/`ARCHIVED` product | Add-to-cart/checkout odrzucony. |
| Browser wysyła własną cenę/VAT/status | Pola ignorowane lub odrzucone; totals pochodzą z DB. |
| Ilość 1..10 | Netto/VAT/brutto zgodne z serwerowym pricingiem. |
| Checkout | `Order=PENDING_PAYMENT`, `paymentStatus=PENDING`, `OrderItem=NOT_STARTED`. |
| Mock success | `Payment=SUCCEEDED`, `Order=PAID`. |
| Mock failure | `Payment/Order=FAILED`, brak `PAID`. |
| Duplicate `eventId` | Wynik `IGNORED`, brak drugiego księgowania. |
| Mismatch kwoty lub waluty | `PaymentEvent=REJECTED`, order nie jest `PAID`. |
| Template-linked item po sukcesie | `READY_FOR_INPUT`; generator nie startuje. |
| Item bez template po sukcesie | Pozostaje `NOT_STARTED`. |
| `ENABLE_CHECKOUT=false` | Mutacje zwracają bezpieczne `503`; UI pokazuje wyłączenie. |
| `ENABLE_LIVE_PAYMENTS` unset/false | Brak live flow. |
| Response/error/log review | Brak raw Prisma errors, stack trace, payloadu webhooka i sekretów. |
| Cross-order token | Obcy/nieprawidłowy token nie daje statusu ani symulacji. |
| Invoice | Wykonaj osobny `INVOICE_SMOKE_CHECKLIST.md`; wyłącznie MOCK/SANDBOX. |
