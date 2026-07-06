# Release Gate

## Gate przed merge

- `npm ci`
- `npm run env:check`
- `npm run prisma:generate`
- `npm run prisma:validate`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:permissions`
- `npm run test:security`
- `npm run build`

## Gate przed staging preview

- Wszystko z gate przed merge.
- `npm run responsive:check` na uruchomionej aplikacji.
- `E2E_BASE_URL=<preview-url> npm run test:e2e`
- Reczne przejscie scenariuszy z `docs/E2E_SCENARIOS.md`.
- Potwierdzenie env i RLS/grantow Supabase.

## Gate przed production

Produkcja nie jest czescia Phase 11R. Przed produkcja trzeba dodatkowo potwierdzic:

- brak `PAYMENT_PROVIDER=mock`,
- realny provider faktur w trybie produkcyjnym,
- osobne klucze R2 i Resend,
- backup/rollback bazy,
- monitoring i log drains,
- finalna zgoda na deploy.
