# CRM_PERMISSIONS

CRM jest dostepny tylko dla uzytkownikow z rola wewnetrzna:

- `ADMIN`
- `LAWYER`
- `OPERATOR`
- `READ_ONLY`

Rola `CLIENT` nie ma dostepu do `/admin`.

## Dostep do tras

| Rola | Dostep |
| --- | --- |
| `ADMIN` | Pelny CRM: dashboard, operacje, pracownicy, ustawienia, audit log i wszystkie detail routes. |
| `LAWYER` | Dashboard, klienci/organizacje, zamowienia w podgladzie, dokumenty/review, naruszenia, zadania osob, zadania, kalendarz, raporty, platforma. |
| `OPERATOR` | Dashboard, ruch/leady/sprzedaz, klienci, zamowienia, dokumenty, zadania osob, inbox, zadania, kalendarz, raporty, ksiegowosc, platforma. Brak ustawien, pracownikow i admin/audit. |
| `READ_ONLY` | Podglad operacyjny bez mutacji. Brak ustawien, pracownikow i admin/audit. |
| `CLIENT` | Brak dostepu do CRM. |

Mapowanie znajduje sie w `src/server/crm/permissions.ts`.

## Mutacje

| Zakres | ADMIN | LAWYER | OPERATOR | READ_ONLY |
| --- | --- | --- | --- | --- |
| `leads` | tak | nie | tak | nie |
| `clients` | tak | nie | tak | nie |
| `orders` | tak | nie | tak* | nie |
| `documents` | tak | tak | nie | nie |
| `breaches` | tak | tak | nie | nie |
| `requests` | tak | tak | nie | nie |
| `messages` | tak | tak | tak | nie |
| `tasks` | tak | tak | tak | nie |
| `employees` | tak | nie | nie | nie |
| `settings` | tak | nie | nie | nie |
| `admin` | tak | nie | nie | nie |

`*` Rola OPERATOR ma zakres operacyjny zamowien, ale reczna zmiana statusu zamowienia w `updateOrderStatusFromCrm` jest admin-only.

## Zasady wymuszane w kodzie

- `getOptionalCrmActor` pobiera sesje NextAuth i odrzuca role spoza CRM.
- `requireCrmActor` blokuje server action bez poprawnego aktora.
- `assertCanMutateCrm` blokuje `READ_ONLY` i role bez danego zakresu.
- `assertAdminCrm` blokuje operacje admin-only.
- UI dostaje `allowedRoutes` i `canMutate`, dzieki czemu nawigacja i przyciski akcji sa role-aware.

## Dostep do organizacji

W Fazie 7 model jest wewnetrzny: role CRM maja globalny dostep do danych operacyjnych wszystkich organizacji. To jest swiadome ograniczenie, bo obecny `UserRole` nie zawiera jeszcze per-organization ACL dla zespolu.

Przed udostepnieniem CRM partnerom albo klientom trzeba dodac:

- membership/assignment per organizacja,
- helper `assertCanAccessOrganization`,
- testy denial dla obcych organizacji,
- RLS albo warstwe API, ktora wymusza ten sam zakres po stronie bazy.

## Supabase i RLS

Prisma uzywa server-side database connection. Nie zakladac, ze nowe tabele public schema sa bezpieczne dla Supabase Data API. Przed produkcja:

- wlaczyc i przetestowac RLS dla tabel CRM, jezeli maja byc widoczne przez Supabase API,
- ograniczyc ekspozycje Data API / GraphQL,
- sprawdzic, czy service role key nie trafia do klienta,
- utrzymac mutacje CRM w server actions lub dedykowanych endpointach serwerowych.
