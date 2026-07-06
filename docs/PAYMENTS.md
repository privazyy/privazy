# PAYMENTS

Faza 5R dodaje architekture platnosci z interfejsem providerow oraz testowym providerem mock. Nie uzywamy realnych danych kart ani produkcyjnej bramki.

## Pliki

- `src/server/payments/payment-provider.ts` - kontrakt providerow.
- `src/server/payments/payment-service.ts` - tworzenie platnosci z serwerowo przeliczonego Order.
- `src/server/payments/webhook-service.ts` - cienka warstwa delegujaca webhook do aktywnego providera.
- `src/server/payments/mock-provider.ts` - testowa implementacja.
- `src/server/payments/index.ts` - wybor providera na podstawie env.
- `src/app/api/payments/create/route.ts` - ponowne utworzenie lub odtworzenie platnosci dla zamowienia.
- `src/app/api/payments/mock/complete/route.ts` - developerskie potwierdzenie platnosci mock.
- `src/app/api/payments/webhook/route.ts` - webhook providera.
- `src/app/api/payments/status/route.ts` - publiczny status po `orderNumber` i tokenie.

## PaymentProvider

Provider musi obslugiwac:

- `createPayment(input)`
- `handleWebhook(request)`
- `getPaymentStatus(paymentId)`
- `refundPayment(paymentId)`

`refundPayment` w mocku zwraca `REFUND_NOT_IMPLEMENTED`, bo zwroty wymagaja decyzji biznesowej i realnej integracji.

## Mock provider

Mock provider:

- tworzy albo odtwarza `Payment` z idempotency key `mock:create:{orderId}`,
- ustawia `providerPaymentId`,
- zwraca URL `/api/payments/mock/complete?...`,
- zapisuje `PaymentEvent` dla webhookow i developerskiego mock-complete,
- po wejsciu w URL oznacza platnosc jako `PAID`,
- aktualizuje `Order` do `PAID`,
- aktualizuje `OrderItem` do `INPUT_REQUIRED`,
- tworzy audit log,
- wystawia mock fakture,
- wysyla e-mail potwierdzajacy platnosc, jesli Resend jest skonfigurowany,
- wysyla event `order/paid` jako punkt zaczepienia dla Fazy 6.

## Webhook

Endpoint:

```text
POST /api/payments/webhook
```

Dla mock providera payload:

```json
{
  "eventId": "mock_evt_123",
  "paymentId": "payment_id",
  "amountGrossCents": 23370,
  "currency": "PLN",
  "status": "paid"
}
```

`status: "failed"` oznacza platnosc jako nieudana. `status: "paid"` oznacza platnosc oplacona. Payload jest walidowany Zod.

Webhook sprawdza naglowek:

```text
x-privazy-mock-signature
```

Jesli `PAYMENT_MOCK_WEBHOOK_SECRET` jest ustawiony, naglowek musi byc rowny secretowi. W produkcji brak secretu jest bledem.

## Idempotencja

Idempotencja jest na kilku poziomach:

- `Payment.idempotencyKey` jest unikalny,
- `PaymentEvent(provider, providerEventId)` jest unikalny,
- `createPayment` uzywa upsertu,
- zduplikowany webhook konczy jako `IGNORED` bez ponownego maila, faktury i eventu Inngest,
- faktura mock nie tworzy duplikatu, jesli istnieje faktura dla zamowienia,
- audit log zapisuje konkretne zdarzenia `payment.paid` albo `payment.failed`.

## Bezpieczenstwo kwot

Klient nigdy nie wysyla ceny. Endpointy platnosci pobieraja kwote z `Order.totalGrossCents`, ktora powstaje po serwerowej kalkulacji koszyka.

Webhook mock porownuje `amountGrossCents` i `currency` z `Payment` oraz `Order`. Mismatch zapisuje `PaymentEvent` ze statusem `FAILED` i `AuditLog` `payment.webhook_rejected`; `Payment` i `Order` nie sa wtedy ksiegowane jako oplacone.

Publiczny status zamowienia wymaga:

- `orderNumber`,
- `publicAccessToken`.

Bez tokenu nie ma dostepu do szczegolow zamowienia.

## E-maile

E-maile sa w `src/server/email/transactional.ts`:

- potwierdzenie zlozenia zamowienia,
- potwierdzenie platnosci,
- blad platnosci,
- faktura wystawiona.
- kolejny krok po oplaceniu: uzupelnienie formularza dokumentu w Fazie 6R.

Jesli `RESEND_API_KEY` albo `RESEND_FROM` nie istnieje, development loguje pominiecie wysylki. Produkcja wymaga env i rzuca blad.

## Env

```bash
PAYMENT_PROVIDER=mock
PAYMENT_MOCK_WEBHOOK_SECRET=replace_in_private_env
PAYMENT_MOCK_AUTO_CAPTURE=false
RESEND_API_KEY=replace_in_private_env
RESEND_FROM=PRIVAZY <kontakt@privazy.pl>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Przed produkcja

- wybrac bramke platnosci, np. Przelewy24, Stripe albo PayU,
- zaimplementowac realnego providera,
- opisac retry i timeouty providera,
- sprawdzic podpisy webhookow wedlug dokumentacji dostawcy,
- mapowac realne provider event id do `PaymentEvent.providerEventId`,
- dodac procedure zwrotow,
- przeprowadzic testy sandbox z realnym providerem,
- potwierdzic teksty maili transakcyjnych.
