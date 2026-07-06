# SHOP_CHECKOUT

Ten dokument opisuje fundament sklepu PRIVAZY z Fazy 5: katalog produktow, koszyk, checkout, zamowienia i przygotowanie pod formularze dokumentow z Fazy 6.

## Trasy

- `/sklep` - katalog aktywnych produktow z bazy danych, z fallbackiem developerskim do seedow.
- `/sklep/[slug]` - strona produktu z SEO i cena liczona z `priceNetCents` oraz `vatRateBps`.
- `/sklep/pakiety` - katalog produktow typu `PACKAGE`.
- `/koszyk` - koszyk oparty o cookie `SHOP_CART_COOKIE_NAME`.
- `/checkout` - formularz danych nabywcy i danych fakturowych.
- `/checkout/sukces` i `/checkout/blad` - rezultat platnosci.
- `/zamowienie/[orderNumber]?token=...` - publiczny status zamowienia zabezpieczony tokenem.

## Modele

Sklep uzywa modeli:

- `Product`, `ProductVariant`
- `Coupon`
- `Cart`, `CartItem`
- `BillingProfile`
- `Order`, `OrderItem`
- `Payment`
- `Invoice`
- `AuditLog`

Produkty startowe sa w `src/lib/shop/products.ts`, a seed jest w `prisma/seed.mjs`. Seed tworzy 12 produktow startowych: pojedyncze dokumenty RODO oraz pakiety Mikro, Standard i Pro.

## Koszyk

Koszyk jest zrodlem prawdy po stronie serwera:

- klient wysyla tylko `productSlug` i ilosc,
- backend pobiera produkt z bazy,
- backend liczy netto, VAT, brutto i rabat,
- koszyk jest trwaly przez cookie sesyjne,
- archiwalne produkty nie moga byc dodane ani zakupione.

Cookie:

- nazwa: `SHOP_CART_COOKIE_NAME`, domyslnie `privazy_cart_id`
- `httpOnly`, `sameSite=lax`, `secure` w produkcji
- czas zycia: 30 dni

Kod rabatowy jest przygotowany w modelu `Coupon` i w kalkulacji koszyka. UI dla wpisywania kodu moze byc rozbudowane w kolejnej fazie.

## Checkout

Checkout zbiera:

- typ klienta: osoba/firma,
- imie i nazwisko,
- e-mail,
- telefon opcjonalny,
- nazwe firmy i NIP dla firmy,
- adres faktury,
- kraj,
- zgody na regulamin, polityke prywatnosci i kontakt.

Walidacja jest w `checkoutPayloadSchema` w `src/server/shop/checkout.ts`.

Checkout tworzy transakcyjnie:

- `Organization`
- `BillingProfile`
- `Order`
- `OrderItem`
- aktualizacje `Cart` do `CHECKED_OUT`
- `AuditLog` z akcja `order.created`

Po zapisaniu zamowienia wywolywany jest `PaymentProvider.createPayment`, a klient dostaje URL platnosci. Kwoty sa zawsze przeliczane po stronie serwera na podstawie aktualnych produktow, wiec klient nie moze podmienic ceny.

## Statusy

`ProductStatus`:

- `DRAFT`
- `ACTIVE`
- `ARCHIVED`

`CartStatus`:

- `ACTIVE`
- `CHECKED_OUT`
- `ABANDONED`
- `MERGED`

`OrderStatus`:

- `PENDING_PAYMENT`
- `PAID`
- `PAYMENT_FAILED`
- `CANCELLED`
- `FULFILLING`
- `COMPLETED`
- `REFUNDED`

`OrderItemStatus`:

- `PENDING_PAYMENT`
- `INPUT_REQUIRED`
- `IN_PROGRESS`
- `READY`
- `FULFILLED`
- `CANCELLED`
- `REFUNDED`

Po potwierdzeniu platnosci `Order` przechodzi na `PAID`, a pozycje w `PENDING_PAYMENT` przechodza na `INPUT_REQUIRED`.

## Powiazanie z Faza 6

Kazdy `OrderItem` dostaje `inputFormPath` w formacie:

```text
/platforma/dokumenty/{orderItemId}/formularz
```

Trasa formularza nie jest jeszcze implementowana w Fazie 5. Model danych, status `INPUT_REQUIRED` i event `order/paid` sa przygotowane pod generator dokumentow.

## CRM i backend

Dane zamowien dla CRM sa przygotowane w `src/server/shop/admin.ts`:

- `listRecentShopOrders`
- `listRecentShopInvoices`
- `listRecentShopPayments`

Pelny redesign CRM nie jest czescia tej fazy. Dane obejmuja klienta, produkty, platnosci, faktury i status realizacji.

## Env

```bash
SHOP_CART_COOKIE_NAME=privazy_cart_id
SHOP_ORDER_TOKEN_TTL_DAYS=30
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=...
DIRECT_URL=...
```

## Przed produkcja

- uruchomic migracje Supabase/Postgres,
- uruchomic seed produktow,
- podlaczyc produkcyjny provider platnosci,
- dopiac regulamin i polityke prywatnosci checkoutu,
- dodac UI kodow rabatowych, jesli rabaty beda publiczne,
- zbudowac formularze dokumentow z Fazy 6.
