# Client Portal Permissions

Portal klienta jest scope'owany organizacja. Dostep do danych nie opiera sie na parametrach UI, tylko na serwerowej sesji i relacjach w bazie.

## Aktor

`getOptionalPlatformActor()` pobiera aktualna sesje NextAuth i uzytkownika z bazy.

Role dopuszczone do portalu:

- `CLIENT` - dostep przez `ClientProfile`,
- `ADMIN`, `LAWYER`, `OPERATOR`, `READ_ONLY` - wewnetrzny dostep zespolu PRIVAZY.

Brak sesji oznacza brak pobierania danych portalu.

## Organizacje

`listAccessibleOrganizations(actor)` zwraca:

- dla roli wewnetrznej - do 100 organizacji, z mozliwoscia podgladu,
- dla `CLIENT` - tylko organizacje z `ClientProfile.userId = actor.id`.

Aktywna organizacja jest wybierana z parametru `?org=...`, ale tylko wtedy, gdy znajduje sie na liscie dostepnej dla aktora. W przeciwnym razie portal wybiera pierwsza dostepna organizacje albo pokazuje stan pusty.

## Role klienta

`ClientOrganizationRole`:

- `OWNER` - moze zarzadzac ustawieniami organizacji,
- `ADMIN` - moze zarzadzac ustawieniami organizacji,
- `MEMBER` - dostep operacyjny bez edycji ustawien,
- `BILLING` - dostep dla rozliczen bez edycji ustawien.

Wewnatrz zespolu PRIVAZY tylko `ADMIN` ma `canManage` dla ustawien organizacji.

## Kontrola rekordow

Kazdy loader danych portalu filtruje rekordy przez `organizationId`:

- dokumenty - `GeneratedDocument.organizationId`,
- formularze dokumentow - `OrderItem` przez `Order.organizationId`,
- zamowienia - `Order.organizationId`,
- naruszenia - `BreachIncident.organizationId`,
- zadania osob - `DataSubjectRequest.organizationId`,
- watki - `ClientMessageThread.organizationId`,
- zadania - `CrmTask.organizationId`,
- timeline - `ClientTimelineEvent.organizationId`.

Akcje serwerowe wywoluja `assertCanAccessOrganization()` albo `assertCanManageOrganization()` przed zapisem.

## Supabase i RLS

Portal ma kontrole aplikacyjna po stronie Next.js, ale to nie zastepuje RLS. Dla produkcyjnej bazy Supabase nalezy:

1. wlaczyc RLS na tabelach publicznego schematu, jezeli beda dostepne przez Supabase API,
2. dopisac polityki per organizacja dla tabel klienta,
3. unikac polityk opartych na nieindeksowanych kolumnach,
4. indeksowac kolumny uzywane w relacjach i politykach (`organizationId`, `userId`, `actorId`),
5. nie zakladac, ze nowe tabele sa automatycznie eksponowane przez Data API albo GraphQL bez sprawdzenia konfiguracji projektu.

Minimalna zasada: nawet gdy aplikacja filtruje po `organizationId`, baza powinna odrzucac odczyt i zapis spoza organizacji.
