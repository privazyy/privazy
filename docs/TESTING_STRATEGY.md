# Testing Strategy

## Zasada

Testy maja chronic kontrakty biznesowe i security, a nie snapshotowac UI. Repo uzywa Vitest w srodowisku Node. E2E jest przygotowane jako smoke test po `E2E_BASE_URL`, ale nie blokuje CI bez stabilnego preview.

## Struktura

- `tests/unit` - czyste funkcje bez bazy: IOD checker, money, idempotency, visibility.
- `tests/integration` - integracje bez zewnetrznych providerow: email template contract.
- `tests/permissions` - role i matrix dostepu CRM/CMS/portal.
- `tests/security` - env, log redaction, event payload, storage keys.
- `scripts/e2e-smoke.mjs` - opcjonalny smoke HTTP dla preview/staging.

## Fixtures

Na tym etapie fixture sa inline i minimalne. Przy dodaniu testow bazodanowych nalezy utworzyc osobny `TEST_DATABASE_URL`, izolowane seedy i transakcyjne czyszczenie danych testowych. Nie wolno seedowac prawdziwych klientow ani danych osobowych.

## Co dodawac dalej

- Testy webhookow platnosci z podpisem providerowym, gdy provider przestanie byc mockiem.
- Testy ACL pobierania dokumentow z mockiem Prisma i R2.
- Testy server actions portalu dla organizacji z kilkoma rolami.
- Playwright E2E dopiero po stabilnym preview i fixture kont testowych.
