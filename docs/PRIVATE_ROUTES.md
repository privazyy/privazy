# Private routes

Centralna klasyfikacja tras jest w `src/server/auth/routes.ts`. Ruch wysokiego poziomu przechwytuje `src/proxy.ts`, bo projekt uzywa Next.js 16 i katalogu `src/app`.

## Public routes

- `/`
- `/blog`
- `/blog/:path*`
- `/sklep`
- `/sklep/:path*`
- `/login`
- `/api/auth/:path*`
- `/api/leads/iod`
- `/sitemap.xml`
- `/robots.txt`
- statyczne assety, w tym `/_next/*`, `/brand/*`, `/favicon.svg`

`/uslugi/:path*`, `/branze/:path*` i `/api/newsletter` powinny zostac dodane do klasyfikacji publicznej dopiero wtedy, gdy te trasy realnie istnieja i sa potwierdzone jako publiczne.

## Staff-only routes

- `/admin`
- `/admin/:path*`
- `/api/admin/:path*`
- `/api/crm/:path*`

Do staff zaliczaja sie `ADMIN`, `LAWYER`, `OPERATOR` i `READ_ONLY`.

## Client-only routes

- `/platforma`
- `/platforma/:path*`
- `/client`
- `/client/:path*`

Aktualny `main` ma tylko `/client`. `/platforma` jest sklasyfikowana jako przyszla prywatna powierzchnia klienta.

## Authenticated routes

- `/dashboard`
- `/dashboard/:path*`
- `/documents`
- `/documents/:path*`
- `/uploads`
- `/uploads/:path*`

Te trasy wymagaja zalogowania. Szczegolowe ograniczenia dokumentow i organizacji zostaja do osobnych PR-ow.

## Zachowanie redirectow

- Brak sesji na prywatnej stronie: redirect do `/login?callbackUrl=...`.
- `CLIENT` na `/admin`: redirect do `/platforma`.
- Staff po loginie: domyslnie `/admin`.
- `CLIENT` po loginie: domyslnie `/platforma`.
- `/api/auth/*` nie jest blokowane przez proxy.
