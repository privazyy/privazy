# CRM_OPERATIONS

Ten dokument opisuje operacyjny CRM PRIVAZY z Fazy 7. CRM nie opiera sie juz na statycznych rekordach demo w komponencie React: dane sa skladane po stronie serwera z modeli Prisma i przekazywane do istniejacego shellu CRM.

## Zakres

Glowny widok:

- `/admin` - panel CRM dostepny tylko dla rol `ADMIN`, `LAWYER`, `OPERATOR`, `READ_ONLY`.
- `src/app/admin/page.tsx` - bramka auth i pobranie aktora CRM.
- `src/server/crm/data.ts` - agregacja dashboardu, list i modulow z bazy.
- `src/server/crm/actions.ts` - role-checked server actions.
- `src/server/crm/permissions.ts` - routing i zakres mutacji per rola.
- `src/server/crm/audit.ts` - wspolny zapis do `AuditLog` i `CrmActivity`.

## Zrodla danych

CRM pobiera realne dane z tabel:

- `Organization`, `ClientProfile`, `User`
- `Product`, `Order`, `OrderItem`, `Payment`, `Invoice`
- `DocumentTemplate`, `DocumentGenerationJob`, `GeneratedDocument`
- `FormSubmission`
- `CrmLead`, `CrmTask`, `CrmNote`, `CrmActivity`, `CrmMessage`, `CrmCalendarEvent`
- `BreachIncident`, `DataSubjectRequest`
- `AuditLog`

Leady IOD z checkera sa dolaczane przez `listIodCrmLeads`, zeby zachowac ciaglosc poprzedniej fazy. Nowe leady operacyjne moga byc przechowywane w `CrmLead`.

## Moduly

- Dashboard: KPI, alerty, funnel, przychod, zadania i aktywnosc z bazy.
- Leady: `CrmLead` plus leady IOD z formularzy; lista i kanban sa grupowane po statusie.
- Klienci i organizacje: `Organization` z licznikami zamowien, dokumentow, zadan i formularzy.
- Zamowienia: `Order`, `OrderItem`, najnowsze `Payment` i `Invoice`.
- Dokumenty i joby: `GeneratedDocument` oraz aktywne/failed `DocumentGenerationJob`.
- Produkty i pakiety: `Product`; szablony dokumentow sa pokazane obok katalogu jako zasob operacyjny.
- Naruszenia: `BreachIncident` z ryzykiem, statusem i terminem 72h.
- Zadania osob: `DataSubjectRequest` z typem, statusem i terminem miesiecznym.
- Zadania, notatki, wiadomosci, kalendarz: wspolne modele CRM powiazane przez `entityType` i `entityId`.
- Pracownicy: `User` z licznikami przypisanych spraw, dostepne tylko dla ADMIN.
- Raporty: podstawowe agregaty liczone z biezacych tabel.
- Audit log: `AuditLog` z uzytkownikiem, organizacja, encja i czasem.

## Akcje

Serwerowe akcje w `src/server/crm/actions.ts` maja Zod validation, auth, role check i audit log:

- `updateCrmLeadStatus`
- `assignCrmLead`
- `createCrmNote`
- `createCrmTask`
- `updateCrmTaskStatus`
- `updateOrderStatusFromCrm` - tylko ADMIN
- `retryDocumentJobFromCrm`
- `updateGeneratedDocumentStatusFromCrm`
- `updateBreachStatusFromCrm`
- `updateDataSubjectRequestStatusFromCrm`

Akcje rewaliduja `/admin` po mutacji. UI w tej fazie ukrywa przyciski mutacji dla READ_ONLY, ale pelne formularze inline dla kazdej akcji pozostaja do rozbudowy w Fazie 8.

## Audit

Kazda nowa mutacja CRM zapisuje:

- `AuditLog` - trwały zapis zgodnosciowy.
- `CrmActivity` - zdarzenie widoczne w osi aktywnosci CRM.

Metadane mutacji sa serializowane do JSON. Dla krytycznych operacji trzeba w kolejnej fazie dopisac `ipAddress` i `userAgent` z request context.

## Ograniczenia

- Granularny IAM per organizacja nie jest jeszcze wdrozony. Role CRM sa internal-global: po zalogowaniu zespol widzi wszystkie organizacje, zgodnie z aktualnym modelem operacyjnym.
- Brakuje osobnych modeli dla kontaktow organizacji, zalacznikow, review komentarzy prawnika i historii pobran plikow.
- Blog, newsletter i outsourcing IOD nie maja jeszcze dedykowanych tabel operacyjnych, wiec CRM pokazuje je jako puste moduly z jasnym komunikatem.
- Zwroty platnosci sa przygotowane w providerze platnosci jako niezaimplementowany flow.
- Supabase Data API / GraphQL exposure musi byc sprawdzone przed produkcja. Nowe tabele Prisma w public schema nie powinny byc traktowane jako publiczne API bez jawnego RLS i ekspozycji.

## Przed produkcja

- Uruchomic migracje na wlasciwej bazie Supabase.
- Zweryfikowac RLS i ekspozycje nowych tabel CRM w Supabase.
- Dodac granularne scope'y organizacyjne, jesli CRM ma byc uzywany poza wewnetrznym zespolem PRIVAZY.
- Podpiac formularze UI do server actions.
- Dodac test runner i testy permissions/mutacji/audytu.
- Dopiac production email/payment/document providers.
