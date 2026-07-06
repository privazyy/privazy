# Security Hardening

## Wprowadzone kontrole

- `env:check` blokuje release, gdy brakuje wymaganych sekretow runtime dla preview/staging/production.
- `validateRuntimeEnv` odrzuca publiczne nazwy env wygladajace jak sekrety.
- `redactSensitiveValue` i `redactLogValue` zapewniaja wspolny helper redakcji tokenow, e-maili, connection stringow i pol oznaczonych jako secret/token/key.
- `safeErrorMessage` ukrywa szczegoly bledow poza development.
- `sanitizeEventPayload` ma test regresyjny, ktory pilnuje, ze eventy workflow nie przenosza bezposredniego PII.
- Testy uprawnien potwierdzaja, ze `CLIENT` nie wchodzi do CRM, a `READ_ONLY` nie mutuje rekordow.

## Supabase i Data API

Supabase nie wystawia juz automatycznie nowych tabel do Data API / GraphQL API bez jawnych grantow. Dla stagingu trzeba recznie sprawdzic migracje, RLS i granty API dla tabel, ktore maja byc dostepne przez Supabase API, zamiast zakladac dostep po samej migracji. Zrodlo: https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically

## Minimalne wymagania staging

- `DATABASE_URL` i `DIRECT_URL` prowadza do wlasciwego projektu Supabase.
- RLS jest wlaczone dla tabel dostepnych przez Supabase client.
- Service role key nie wystepuje w `NEXT_PUBLIC_*`.
- R2 ma osobne klucze dla stagingu.
- E-maile i platnosci uzywaja trybu testowego lub mockowego, jawnie opisanego w release note.
- Logi nie zawieraja surowych webhook body, linkow z tokenami ani danych dokumentow.
