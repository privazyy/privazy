# QA Plan

## Cel

Phase 11R stabilizuje repo przed stagingiem. Zakres obejmuje testy jednostkowe, integracyjne, uprawnieniowe, security, env contract, responsive sanity i release gate. Nie obejmuje produkcyjnego wdrozenia.

## Warstwy kontroli

| Warstwa | Komenda | Zakres |
| --- | --- | --- |
| Env contract | `npm run env:check` | Brak sekretow publicznych, wymagane zmienne release dla preview/staging/production. |
| Prisma | `npm run prisma:generate`, `npm run prisma:validate` | Sprawnosc klienta i schematu. |
| Unit | `npm run test:unit` | Silnik IOD, koszyk, pieniadze, idempotency, widocznosc bloga. |
| Integration | `npm run test:integration` | Szablony emaili i bezpieczne linkowanie do portalu. |
| Permissions | `npm run test:permissions` | CRM, CMS, portal klienta, role READ_ONLY/CLIENT. |
| Security | `npm run test:security` | Redakcja logow, payload eventow, env leakage, R2 key hygiene. |
| Build | `npm run build` | Next.js production build. |
| Responsive | `npm run responsive:check` | Publiczne trasy landing/blog/shop/cart/checkout przy wielu viewportach. |
| E2E smoke | `npm run test:e2e` | Opcjonalne HTTP smoke po ustawieniu `E2E_BASE_URL`. |

## Kolejnosc przed stagingiem

1. `npm ci`
2. `npm run qa:ci`
3. Uruchom aplikacje lokalnie lub preview i wykonaj `npm run responsive:check`.
4. Ustaw `E2E_BASE_URL` na preview i wykonaj `npm run test:e2e`.
5. Sprawdz recznie checkout, portal, pobieranie dokumentow i podstawowe flow CRM.

## Stop criteria

- Brak czerwonych testow w `qa:ci`.
- Brak sekretow w `.env.example`, logach i publicznych nazwach env.
- Brak nowych tras prywatnych bez server-side access check.
- Brak publicznego pobierania dokumentow poza endpointem z audytem i podpisanym URL.
- Brak produkcyjnego deploya z `PAYMENT_PROVIDER=mock`.
