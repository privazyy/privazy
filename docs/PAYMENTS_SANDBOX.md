# Payments Mock / Sandbox

## Provider

`src/server/payments/provider.ts` definiuje:

- `createPayment`,
- `getPaymentStatus`,
- `verifyWebhook`,
- `handleWebhookEvent`.

Jedyną implementacją jest `MockPaymentProvider`. Nie importuje SDK operatora,
nie wymaga kluczy live i nie przetwarza kart.

## Webhook

`POST /api/payments/mock/webhook`:

- czyta raw body,
- waliduje payload Zod,
- w produkcyjnym runtime wymaga HMAC SHA-256 w `x-privazy-mock-signature`,
- zapisuje wyłącznie hash payloadu, nie raw payload,
- używa unikalnego `PaymentEvent.idempotencyKey`,
- odrzuca mismatch kwoty/waluty,
- nie księguje ponownie duplicate eventu.

Payload:

```json
{
  "eventId": "mock-event-001",
  "paymentId": "payment-id",
  "outcome": "succeeded",
  "amountGrossCents": 23370,
  "currency": "PLN"
}
```

UI używa osobnego endpointu symulacyjnego chronionego tokenem zamówienia.
Kwota i waluta są w nim pobierane z DB, nie z browsera.

`ENABLE_LIVE_PAYMENTS=false` pozostaje wymaganym defaultem. Ustawienie flagi
na true nie uruchomi płatności: brak implementacji jest fail-closed.
