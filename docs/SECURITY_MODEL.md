# Security model

Status po tym PR: aplikacja nadal ma decyzje NO-GO dla staging i produkcji. Ten PR zamyka albo ogranicza najpilniejsze ryzyka wokol prywatnych tras i CRM, ale nie jest pelnym zamknieciem wszystkich P0.

## Warstwy ochrony

1. `src/server/auth/routes.ts` definiuje centralna klasyfikacje tras: public, staff-only, client-only i authenticated.
2. `src/proxy.ts` wykonuje pierwszy guard ruchu dla prywatnych stron i `/api/crm/*`.
3. `src/server/auth/guards.ts` wykonuje server-side guard w miejscach, ktore pobieraja dane albo wykonuja operacje.
4. `src/app/admin/page.tsx` sprawdza `requireCrmAccess()` przed jakimkolwiek pobraniem danych CRM.
5. `src/server/env/private.ts` sprawdza minimalna konfiguracje DB dla CRM po guardzie dostepu.

Proxy nie jest jedyna warstwa autoryzacji. Strony i API, ktore dotykaja danych prywatnych, musza dalej uzywac guardow serwerowych.

## Co zabezpiecza ten PR

- `/admin` nie renderuje publicznie.
- Niezalogowany uzytkownik jest kierowany do `/login?callbackUrl=/admin`.
- Rola `CLIENT` nie moze wejsc do CRM.
- Role staff moga wejsc do CRM zgodnie z polityka odczytu.
- `READ_ONLY` jest odroznione od rol mutujacych w `canMutateCrm()` i `requireCrmMutation()`.
- Brak `DATABASE_URL` nie uruchamia publicznego pobierania danych CRM i pokazuje kontrolowany stan po autoryzacji.
- `/api/crm/*` jest objete centralnym guardem i `GET /api/crm/leads` ma dodatkowy server-side guard.

## Co zostaje do kolejnych PR-ow

- `[security] protect CRM API routes`
- `[security] gate document generation by auth and organization`
- `[security] enforce organization scope in document queries`
- `[ops] add env validation and staging readiness checks`
- `[test] add security and release smoke tests`
- `[security] add lead endpoint abuse protection`

Staging readiness: NO.

Production readiness: NO.
