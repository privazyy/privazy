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

1. `[legal] add public legal documents and approval workflow`.
2. Live invoice provider, PDF, korekty i formalna numeracja dopiero po approval.
3. Rozproszony rate limiter i automatyczne testy commerce.
4. Pełny Supabase RLS/Data API audit całej bazy.
5. Customer document-input flow powiązany z opłaconym `OrderItem`; obecny
   generator pozostaje dostępny wyłącznie jako jawny staff override.
6. Legal review finalnych dokumentów.
7. Osobny, kontrolowany PR realnego payment providera dopiero po sandbox verification.
