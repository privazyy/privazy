# Commerce Baseline Audit

| Area | Stan `main` przed PR | Ryzyko | Zachowanie wymagane | Status po PR |
| --- | --- | --- | --- | --- |
| Katalog | Jedna statyczna strona produktu i dane w `src/lib/product.ts`. | Produktowe claims nie miały pokrycia w systemie. | Katalog `Product` z aktywnymi produktami sandbox. | Dodano fundament. |
| CTA | Lokalny licznik koszyka bez persystencji. | UI sugerowało działający zakup. | Serwerowy koszyk i jawny komunikat MOCK/SANDBOX. | Dodano. |
| Cena | Cena była stałą frontendową. | Manipulacja ceną, VAT i totals. | Produkt i cena pobierane z DB, kwoty liczone na serwerze. | Dodano. |
| Koszyk | Brak modeli i API. | Brak wiarygodnego stanu zamówienia. | `Cart`/`CartItem`, HttpOnly cookie i CRUD z Zod. | Dodano. |
| Checkout | Brak API i zamówień. | Nie było ścieżki product -> order. | Walidowany checkout tworzący `Order`/`OrderItem`. | Dodano sandbox. |
| Płatność | Brak providera, eventów i webhooka. | Klient mógłby w przyszłości sterować `PAID`. | Mock provider, zgodność kwoty/waluty i idempotentne eventy. | Dodano sandbox. |
| Faktury | Brak modelu i providera. | Obietnica faktury nie miała implementacji. | Tylko zapis intencji; faktury w osobnym PR. | Nadal brak. |
| Dokumenty | Generator nie miał paid-order gate. | Fulfillment bez zakupu. | Po zgodnym sukcesie tylko template-linked `OrderItem` przechodzi do `READY_FOR_INPUT`. | Dodano hook; generator pozostaje osobnym P1. |
| Data API | Brak commerce tables. | Nowe tabele w `public` mogłyby dostać automatyczne grants. | RLS oraz revoke dla `PUBLIC`, `anon`, `authenticated`. | Dodano w migracji. |

## Zakres

Ten PR wdraża wyłącznie katalog, koszyk, checkout, zamówienie, płatność
mock/sandbox, idempotentny webhook i hook fulfillment. Nie wdraża realnego
operatora, kart, faktur, automatycznego generatora ani produkcyjnej sprzedaży.
