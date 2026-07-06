# PAYMENTS

Faza 5 dodaje architekture platnosci z interfejsem providerow oraz testowym providerem mock. Nie uzywamy realnych danych kart ani produkcyjnej bramki.

## Pliki

- `src/server/payments/payment-provider.ts` - kontrakt providerow.
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
  "paymentId": "payment_id",
  "status": "paid"
}
```

`status: "failed"` oznacza platnosc jako nieudana. Kazdy inny status w mocku oznacza platnosc jako oplacona.

Webhook sprawdza naglowek:

```text
x-privazy-mock-signature
```

Jesli `PAYMENT_MOCK_WEBHOOK_SECRET` jest ustawiony, naglowek musi byc rowny secretowi. W produkcji brak secretu jest bledem.

## Idempotencja

Idempotencja jest na kilku poziomach:

- `Payment.idempotencyKey` jest unikalny,
- `createPayment` uzywa upsertu,
- `markPaymentPaid` ignoruje juz oplacona platnosc,
- faktura mock nie tworzy duplikatu, jesli istnieje faktura dla zamowienia,
- audit log zapisuje konkretne zdarzenia `payment.paid` albo `payment.failed`.

## Bezpieczenstwo kwot

Klient nigdy nie wysyla ceny. Endpointy platnosci pobieraja kwote z `Order.totalGrossCents`, ktora powstaje po serwerowej kalkulacji koszyka.

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
- dodac procedure zwrotow,
- przeprowadzic testy sandbox z realnym providerem,
- potwierdzic teksty maili transakcyjnych.
