# Invoicing Mock / Sandbox

## Zakres

Faktury działają wyłącznie jako jawny workflow `MOCK`. Rekord ze statusem
`ISSUED` nie jest fakturą księgową, nie ma produkcyjnej numeracji ani PDF.

## Flow

1. Uwierzytelniony actor wywołuje `POST /api/invoices/order/[orderId]/issue`.
2. Serwis sprawdza rolę oraz własność ordera/organizacji.
3. Order musi mieć `PAID`, `paymentStatus=SUCCEEDED`, intencję faktury i zgodną
   płatność `SUCCEEDED`.
4. Buyer snapshot pochodzi z `BillingProfile`, a kwoty wyłącznie z `Order`.
5. Unikalne `Invoice.orderId` zapewnia jedną fakturę na zamówienie.
6. Provider MOCK nadaje numer `MOCK/YYYY/NNNNNN`, tworzy hash eventu i ustawia
   `ISSUED`.

Powtórne żądanie jest idempotentne i zwraca istniejący rekord.

## API

- `POST /api/invoices/order/[orderId]/issue` — request + issue mock,
- `GET /api/invoices/[invoiceId]` — odczyt faktury w scope actora,
- `GET /api/orders/[orderId]/invoice` — odczyt po orderze.

Odpowiedzi nie zawierają raw provider payloadów. `externalId` i wewnętrzne dane
operacyjne nie są zwracane klientowi.
