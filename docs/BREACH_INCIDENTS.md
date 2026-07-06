# Breach Incidents

Phase 8 udostepnia klientowi rejestr i formularz zgloszenia naruszenia ochrony danych pod `/platforma/naruszenia`.

## Formularz klienta

Nowe zgloszenie wymaga:

- tytulu zdarzenia,
- daty wykrycia,
- wstepnej pilnosci,
- opisu zdarzenia,
- kategorii danych,
- potencjalnych skutkow.

Opcjonalnie klient moze podac date wystapienia i szacowana liczbe osob.

## Zapis

Akcja `createBreachIncidentAction`:

1. wymaga sesji i dostepu do organizacji,
2. waliduje dane przez Zod,
3. tworzy `BreachIncident`,
4. nadaje numer `NAR-YYYY-XXXXXXXX`,
5. ustawia `authorityDueAt` i `dataSubjectsDueAt` na 72h od daty wykrycia,
6. tworzy zadanie CRM triage,
7. zapisuje `AuditLog`,
8. zapisuje `ClientTimelineEvent`,
9. wysyla potwierdzenie email przez warstwe transakcyjna.

## Statusy

Statusy bazowe pochodza z `BreachIncidentStatus`:

- `NEW`,
- `TRIAGE`,
- `RISK_ASSESSMENT`,
- `INVESTIGATING`,
- `NOTIFICATION_REQUIRED`,
- `NOTIFIED_AUTHORITY`,
- `NOTIFIED_DATA_SUBJECTS`,
- `CLOSED`,
- `ARCHIVED`.

Widok klienta nie pozwala samodzielnie podejmowac decyzji notyfikacyjnych. Decyzje i zamkniecie sprawy pozostaja w CRM.

## Audyt

Utworzenie zgloszenia zapisuje:

- `AuditLog.action = client.breach_created`,
- `ClientTimelineEvent.type = BREACH_CREATED`,
- zadanie CRM powiazane z `entityType = BreachIncident`.

## Poza zakresem

- automatyczne wyslanie zgloszenia do organu,
- automatyczne zawiadomienie osob,
- upload zalacznikow,
- legalna kwalifikacja zdarzenia bez review zespolu PRIVAZY.
