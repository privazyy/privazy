# Payment Status Model

## Payment

- `CREATED` — zarezerwowany rekord/stan zamówienia,
- `PENDING` — mock payment utworzony,
- `SUCCEEDED` — zgodny, idempotentny event sukcesu,
- `FAILED` — event testowego błędu,
- `CANCELLED` — zarezerwowane anulowanie.

## Order

- checkout tworzy `PENDING_PAYMENT`,
- tylko `PaymentEvent` ze zgodną kwotą/walutą może ustawić `PAID`,
- mock failure ustawia `FAILED`, o ile order nie był już `PAID`,
- duplicate event daje `IGNORED`,
- mismatch daje `REJECTED` i nie zmienia order na `PAID`.

## OrderItem

- `NOT_STARTED` przed płatnością,
- `READY_FOR_INPUT` po sukcesie wyłącznie, gdy istnieje `documentTemplateId`,
- `IN_PROGRESS`, `COMPLETED`, `CANCELLED` są hookami przyszłego fulfillment.

Ten PR nie uruchamia generatora dokumentów.
