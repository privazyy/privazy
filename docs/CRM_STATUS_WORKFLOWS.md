# CRM_STATUS_WORKFLOWS

Ten dokument opisuje statusy i podstawowe workflow obslugiwane w Fazie 7.

## Leady

Enum `CrmLeadStatus`:

- `NEW`
- `CONTACT_REQUIRED`
- `CONTACTED`
- `QUALIFIED`
- `OFFER_SENT`
- `WON`
- `LOST`
- `ARCHIVED`

Akcje:

- `updateCrmLeadStatus` zmienia status, ustawia `wonAt`, `lostAt` albo `archivedAt` zgodnie ze statusem i zapisuje audit.
- `assignCrmLead` przypisuje opiekuna.
- `createCrmNote` i `createCrmTask` moga byc powiazane z leadem przez `entityType = "CrmLead"` i `entityId`.

Konwersja w organizacje/zamowienie nie ma jeszcze osobnego modelu deal/opportunity. Status `WON` jest punktem zaczepienia dla Fazy 8.

## Zadania

Enum `CrmTaskStatus`:

- `OPEN`
- `IN_PROGRESS`
- `BLOCKED`
- `DONE`
- `CANCELLED`

`updateCrmTaskStatus` ustawia `completedAt` przy `DONE`. Zadanie moze wskazywac dowolna encje przez `entityType` i `entityId`.

## Dokumenty i generatory

`DocumentGenerationJob`:

- `PENDING`
- `PROCESSING`
- `COMPLETED`
- `FAILED`

`GeneratedDocument`:

- `DRAFT`
- `GENERATED`
- `DELIVERED`
- `ARCHIVED`

Akcje:

- `retryDocumentJobFromCrm` resetuje failed job do `PENDING`, czysci `errorMessage`, wysyla event `document/generate.requested` i zapisuje audit.
- `updateGeneratedDocumentStatusFromCrm` zmienia status dokumentu i zapisuje audit.

Review prawnika, komentarze review, reject reason i historia pobran wymagaja dedykowanych modeli w kolejnej fazie.

## Zamowienia

`OrderStatus`:

- `PENDING_PAYMENT`
- `PAID`
- `PAYMENT_FAILED`
- `CANCELLED`
- `FULFILLING`
- `COMPLETED`
- `REFUNDED`

`updateOrderStatusFromCrm` jest dostepne tylko dla ADMIN. OPERATOR moze pracowac na module zamowien, ale nie ma prawa do recznej zmiany statusu.

Zwroty i anulowania wymagaja integracji z providerem platnosci. Obecny mock provider zwraca refund jako niezaimplementowany flow.

## Naruszenia ochrony danych

Enum `BreachIncidentStatus`:

- `NEW`
- `TRIAGE`
- `INVESTIGATING`
- `RISK_ASSESSMENT`
- `NOTIFICATION_REQUIRED`
- `NOTIFIED_AUTHORITY`
- `NOTIFIED_DATA_SUBJECTS`
- `CLOSED`
- `ARCHIVED`

Enum `BreachRiskLevel`:

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

`updateBreachStatusFromCrm` zmienia status, ustawia `closedAt` przy `CLOSED` i zapisuje audit. Dashboard liczy aktywne naruszenia oraz sprawy blisko terminu 72h na podstawie `authorityDueAt`.

Do Fazy 8 zostaja: timeline decyzji, zalaczniki, komentarze, powiadomienia do UODO i osob, oraz osobny approve flow.

## Zadania osob

Enum `DataSubjectRequestType`:

- `ACCESS`
- `RECTIFICATION`
- `ERASURE`
- `RESTRICTION`
- `PORTABILITY`
- `OBJECTION`
- `CONSENT_WITHDRAWAL`
- `OTHER`

Enum `DataSubjectRequestStatus`:

- `NEW`
- `IDENTITY_VERIFICATION`
- `IN_PROGRESS`
- `WAITING_FOR_CLIENT`
- `READY_FOR_REVIEW`
- `RESPONDED`
- `CLOSED`
- `ARCHIVED`

`updateDataSubjectRequestStatusFromCrm` zmienia status, ustawia `respondedAt` przy `RESPONDED`, `closedAt` przy `CLOSED` i zapisuje audit. Dashboard liczy aktywne zadania osob oraz sprawy z terminem w ciagu 7 dni.

## Audit workflow

Kazda server action CRM wykonuje sekwencje:

1. Odczyt aktora przez NextAuth.
2. Sprawdzenie roli i zakresu mutacji.
3. Walidacja Zod.
4. Mutacja Prisma.
5. Zapis `AuditLog`.
6. Zapis `CrmActivity`.
7. `revalidatePath("/admin")`.

Brak test runnera w repo oznacza, ze w tej fazie workflow sa weryfikowane przez `prisma validate`, `prisma generate`, `lint`, `typecheck`, `build` i reczna inspekcje migracji.
