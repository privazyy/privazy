# ECOMMERCE_SECURITY

Ten dokument opisuje zasady bezpieczenstwa sklepu PRIVAZY w Fazie 5R. Implementacja jest sandbox/foundation i nie przyjmuje produkcyjnych platnosci.

## Zasady kwot

- Frontend nigdy nie wysyla ceny jako zrodla prawdy.
- Dodanie do koszyka przyjmuje tylko `productSlug` i `quantity`.
- Backend pobiera aktywny `Product`/`ProductVariant` i liczy netto, VAT oraz brutto.
- Checkout ponownie przelicza koszyk z bazy przed utworzeniem `Order`.
- Produkty `ARCHIVED` i `DRAFT` nie moga byc kupowane.
- Produkty z cena 0 sa blokowane, dopoki model nie ma jawnej reguly darmowego checkoutu.
- Kupony sa uwzgledniane tylko gdy sa aktywne, w oknie dat, w limicie uzyc i w tej samej walucie.

## Walidacja API

Endpointy mutacyjne i platnicze uzywaja Zod:

- `POST /api/cart/items`
- `PATCH /api/cart/items/[itemId]`
- `POST /api/checkout/create`
- `POST /api/payments/create`
- `POST /api/payments/webhook`
- `GET /api/payments/status`
- `GET /api/payments/mock/complete`

Route handlers dzialaja w `nodejs` runtime i nie powinny opierac autoryzacji wylacznie na proxy/middleware.

## Status publiczny

Nie ma publicznej trasy order detail po samym ID. Publiczny status wymaga:

- `orderNumber`,
- `publicAccessToken`.

Bez tokenu strona zwraca `notFound()` albo API zwraca 400/404. Dane faktury sa widoczne tylko w ograniczonym zakresie statusu tokenowego; pelny buyer snapshot zostaje w bazie.

## Webhook idempotency

`PaymentEvent` jest podstawowym zabezpieczeniem webhookow:

- unikalne `(provider, providerEventId)`,
- status `RECEIVED`, `PROCESSED`, `FAILED` albo `IGNORED`,
- zapis raw payload,
- zapis kwoty i waluty z eventu,
- audit log dla accepted/rejected payment event.

Duplikat eventu nie wysyla drugi raz maila, nie wystawia drugiej faktury i nie emituje drugi raz efektow biznesowych.

## Provider sandbox

W Fazie 5R aktywny jest tylko `PAYMENT_PROVIDER=mock`. Realny provider live jest poza zakresem. Brak `PAYMENT_MOCK_WEBHOOK_SECRET` w produkcji jest bledem.

Przed realnym providerem trzeba dodac:

- weryfikacje podpisu wedlug dokumentacji providera,
- retry i timeout policy,
- mapowanie provider event id,
- sandbox testy kwoty, waluty, failure i duplikatow,
- procedure refund/cancel z Fazy 12R.

## Supabase Data API i RLS

Nowe tabele Prisma w publicznym schemacie Postgres nie sa automatycznie bezpieczne dla Supabase Data API. Przed ekspozycja przez Supabase client trzeba osobno:

- zdecydowac, czy tabela ma byc wystawiona do Data API,
- wlaczyc RLS,
- dodac policy per rola i organizacja,
- dodac wymagane granty dla `anon`/`authenticated`,
- zweryfikowac to w stagingu.

Aplikacja w tej fazie korzysta z serwerowego Prisma, wiec Supabase Data API/RLS pozostaje osobnym follow-upem.

## E-maile

Resend jest opcjonalny w development. Brak `RESEND_API_KEY` albo `RESEND_FROM` loguje pominiecie wysylki lokalnie i nie blokuje checkoutu. Produkcja powinna miec env ustawione przed wlaczeniem sprzedazy.

## Blokery produkcyjne

- brak realnego providera platnosci sandbox/live,
- brak finalnego regulaminu i polityk prawnych po review,
- brak generatorow dokumentow Fazy 6R,
- brak reviewed RLS/grants dla Supabase Data API,
- brak procedur refundow i korekt,
- brak test runnera automatyzujacego scenariusze checkout/payment/invoice.
