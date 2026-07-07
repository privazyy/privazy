# CRM access control

## Boundary

CRM jest staff-only. Publiczny uzytkownik i rola `CLIENT` nie moga renderowac `/admin` ani pobierac danych CRM.

`src/app/admin/page.tsx` wykonuje:

1. `requireCrmAccess({ mode: "redirect", callbackUrl: "/admin" })`
2. minimalne sprawdzenie konfiguracji DB
3. dopiero potem `getCrmDatabaseData()`

To oznacza, ze brak sesji albo rola `CLIENT` zatrzymuja wykonanie przed pobraniem danych z `src/server/crm/data.ts`.

## Brak konfiguracji DB

`src/server/env/private.ts` sprawdza `DATABASE_URL` przed odczytem CRM. Jezeli zmienna nie istnieje, staff widzi kontrolowany ekran konfiguracji bez stack trace i bez sekretow.

Publiczny uzytkownik nie widzi bledu konfiguracji, bo najpierw trafia do `/login`.

## API CRM

`src/proxy.ts` obejmuje `/api/crm/:path*`, a `GET /api/crm/leads` ma dodatkowo `requireCrmAccess()` w route handlerze.

To jest minimalne zabezpieczenie dla obecnego endpointu. Pelny PR `[security] protect CRM API routes` nadal powinien sprawdzic wszystkie przyszle metody, mutacje, rate limiting, audyt i kontrakty odpowiedzi.

## Mutacje

Ten PR nie dodaje nowych mutacji CRM. Polityka jest przygotowana w helperach:

- `canMutateCrm()` pozwala mutowac tylko `ADMIN`, `LAWYER`, `OPERATOR`.
- `READ_ONLY` nie przechodzi `canMutateCrm()`.
- `CLIENT` nie przechodzi dostepu do CRM.
