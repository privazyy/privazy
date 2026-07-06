# Client Portal Security

Portal klienta jest zabezpieczony aplikacyjnie w Next.js i musi miec osobny przeglad RLS/Data API przed produkcja Supabase.

## Izolacja organizacji

Centralna warstwa znajduje sie w `src/server/platform/permissions.ts`.

Najwazniejsze helpery:

- `canAccessClientPortal(user)`
- `getActiveOrganizationForUser(actor, requestedOrganizationId)`
- `assertClientOrganizationAccess(actor, organizationId)`
- `assertCanReadClientDocument(actor, documentId)`
- `assertCanDownloadClientDocument(actor, documentId, format)`
- `assertCanCreateBreach(actor, organizationId)`
- `assertCanCreateDataSubjectRequest(actor, organizationId)`
- `assertCanManageOrganizationSettings(actor, organizationId)`

`CLIENT` dostaje organizacje przez `ClientProfile.userId`. Role wewnetrzne `ADMIN`, `LAWYER`, `OPERATOR` i `READ_ONLY` moga wejsc w podglad portalu, ale UI pokazuje banner pracownika. `CLIENT` nie ma dostepu do CRM.

## Download dokumentow

Endpoint `/api/platforma/dokumenty/[id]/download`:

1. wymaga sesji,
2. waliduje format pliku,
3. uzywa `assertCanDownloadClientDocument`,
4. zwraca `404` przy braku dostepu, zeby nie ujawnic istnienia cudzego dokumentu,
5. zapisuje `DocumentDownload`,
6. zapisuje audit i timeline,
7. generuje krotko wazny signed URL R2,
8. nie zwraca raw `fileKey` do UI.

## Walidacja i audyt

Server actions portalu uzywaja Zod i nie powinny zwracac surowych bledow Prisma do klienta. Wazne akcje tworza `AuditLog` i `ClientTimelineEvent`:

- formularz dokumentu,
- zgloszenie naruszenia,
- zadanie osoby,
- wiadomosc,
- wykonanie zadania,
- aktualizacja organizacji,
- pobranie dokumentu.

## Supabase

Prisma korzysta z server-side database connection, ale Supabase Data API / GraphQL trzeba sprawdzic osobno. Aktualne domyslne zachowanie Supabase moze wymagac jawnych `GRANT` dla nowych tabel w `public`, a RLS pozostaje osobna warstwa kontroli wierszy.

Przed produkcja:

- wlaczyc RLS na tabelach portalu, jesli sa eksponowane przez Supabase API,
- dodac polityki per organizacja,
- dodac jawne granty tylko tam, gdzie Data API jest potrzebne,
- uruchomic Supabase advisors,
- upewnic sie, ze service role key nie jest dostepny w kliencie,
- przetestowac denial dla obcej organizacji i cudzego dokumentu.

## Poza zakresem tej fazy

- produkcyjny deploy,
- publiczne udostepnianie plikow,
- zalaczniki wiadomosci,
- CMS/blog engine,
- automatyczne decyzje prawne bez review zespolu PRIVAZY.
