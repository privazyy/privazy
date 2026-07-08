# Audit Gap Closure Plan — Commerce

## Ograniczone w tym PR

- realny serwerowy katalog i pricing,
- persystentny koszyk sandbox,
- checkout tworzący order,
- mock provider i payment event,
- idempotencja webhooka,
- amount/currency validation,
- jawne oznaczenie sandbox,
- feature flags,
- hook `READY_FOR_INPUT`,
- RLS/revoke nowych tabel.

## Nadal otwarte

1. `[commerce] add invoice foundation`.
2. Rozproszony rate limiter i automatyczne testy commerce.
3. Pełny Supabase RLS/Data API audit całej bazy.
4. Customer document-input flow powiązany z opłaconym `OrderItem`; obecny
   generator pozostaje dostępny wyłącznie jako jawny staff override.
5. Legal review finalnych dokumentów.
6. Osobny, kontrolowany PR realnego providera dopiero po sandbox verification.
