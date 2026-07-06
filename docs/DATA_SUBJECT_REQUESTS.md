# Data Subject Requests

Phase 8 dodaje klientowi rejestr i formularz zadan osob, ktorych dane dotycza, pod `/platforma/zadania-osob`.

## Formularz klienta

Nowe zadanie wymaga:

- osoby albo identyfikatora osoby,
- typu zadania,
- daty otrzymania,
- kanalu,
- tresci zadania,
- informacji, czy tozsamosc zostala zweryfikowana.

Email osoby jest opcjonalny.

## Typy

`DataSubjectRequestType`:

- `ACCESS`,
- `RECTIFICATION`,
- `ERASURE`,
- `RESTRICTION`,
- `PORTABILITY`,
- `OBJECTION`,
- `CONSENT_WITHDRAWAL`,
- `OTHER`.

## Zapis

Akcja `createDataSubjectRequestAction`:

1. wymaga sesji i dostepu do organizacji,
2. waliduje dane przez Zod,
3. tworzy `DataSubjectRequest`,
4. nadaje numer `ZAD-YYYY-XXXXXXXX`,
5. ustawia termin `dueAt` na 30 dni od daty otrzymania,
6. ustawia `IDENTITY_VERIFICATION`, jezeli tozsamosc nie jest potwierdzona,
7. tworzy zadanie CRM,
8. zapisuje `AuditLog`,
9. zapisuje `ClientTimelineEvent`,
10. wysyla potwierdzenie email.

## Statusy

Statusy bazowe:

- `NEW`,
- `IDENTITY_VERIFICATION`,
- `IN_PROGRESS`,
- `WAITING_FOR_CLIENT`,
- `READY_FOR_REVIEW`,
- `RESPONDED`,
- `CLOSED`,
- `ARCHIVED`.

Klient rejestruje zadanie i widzi status. Odpowiedz, review prawne i zamkniecie pozostaja po stronie CRM.

## Audyt

Utworzenie zadania zapisuje:

- `AuditLog.action = client.data_subject_request_created`,
- `ClientTimelineEvent.type = REQUEST_CREATED`,
- zadanie CRM powiazane z `entityType = DataSubjectRequest`.

## Poza zakresem

- automatyczne wygenerowanie odpowiedzi do osoby,
- upload zalacznikow,
- automatyczna wysylka odpowiedzi,
- rozbudowany workflow weryfikacji tozsamosci.
