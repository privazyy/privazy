# Shop and Sandbox Checkout

## Tryb

Cały sklep jest oznaczony `MOCK / SANDBOX`. Nie pobiera środków ani danych
karty. `ENABLE_CHECKOUT` kontroluje operacje koszyka i checkoutu; bez jawnego
ustawienia produkcyjny default jest wyłączony. `ENABLE_LIVE_PAYMENTS` pozostaje
`false`, a kod nie zawiera live providera.

## Trasy

- `/sklep` i `/sklep/[slug]` — katalog i produkt,
- `/koszyk` — serwerowy koszyk,
- `/checkout` — dane testowego zamówienia,
- `/checkout/mock` — jawna symulacja sukcesu/błędu,
- `/checkout/sukces` i `/checkout/blad` — wynik testowy,
- `/zamowienie/[orderNumber]?token=...` — status chroniony tokenem.

## Flow

1. Browser wysyła wyłącznie slug produktu i ilość.
2. Serwer pobiera aktywny `Product`, sprawdza PLN i liczy netto/VAT/brutto.
3. Surowy token koszyka istnieje tylko w HttpOnly cookie; baza przechowuje jego hash jako `Cart.anonymousId`.
4. Checkout ponownie pobiera aktualne produkty i przelicza totals.
5. Transakcja tworzy billing snapshot, `Order` i `OrderItem`; rekord organizacji powstaje tylko dla checkoutu firmowego.
6. Mock provider tworzy idempotentny `Payment`.
7. Symulacja/webhook tworzy `PaymentEvent`, porównuje kwotę i walutę, a dopiero potem może ustawić `SUCCEEDED` i `Order.PAID`.
8. Template-linked `OrderItem` przechodzi do `READY_FOR_INPUT`; dokument nie jest generowany.

Publiczne API ma walidację Zod, bezpieczne błędy i best-effort rate limit.
Docelowy rozproszony rate limiter pozostaje follow-upem przed stagingiem.
