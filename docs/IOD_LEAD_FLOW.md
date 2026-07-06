# IOD Lead Flow

Ten dokument opisuje bezpieczny przepływ wyniku checkera IOD do backendu w Phase 4R.

## Wejście Użytkownika

Landing używa istniejącego silnika checkera:

- `mapLandingAnswersToObligationInput`
- `evaluateIodObligation`
- `mapIodObligationToOutcomeKey`

Po zakończeniu checkera użytkownik widzi wynik i może wysłać dane kontaktowe przez `LeadCaptureForm` z `endpoint="/api/leads/iod"`.

Formularz przekazuje:

- `answers` - pełny snapshot odpowiedzi z publicznego checkera,
- `result` - klientowy snapshot tytułu, statusu, triggera i skali,
- `complianceResult` - klientowy snapshot wyniku silnika,
- `contact.name`,
- `contact.email`,
- opcjonalnie `contact.phone`, `contact.company`, `contact.nip`,
- `contact.privacyConsent`,
- opcjonalną wiadomość,
- `source.page`, `source.placement`, `source.subject`,
- `source.utm`,
- `security.website` jako honeypot,
- `security.turnstileToken`, jeśli widget Turnstile jest obecny na stronie.

## Endpoint

Endpoint: `src/app/api/leads/iod/route.ts`.

Zasady:

- route jest publiczny i działa w runtime `nodejs`,
- payload jest walidowany przez `iodLeadPayloadSchema`,
- błędy walidacji zwracają ogólny komunikat bez `flatten()` i bez szczegółów pól,
- honeypot zwraca neutralne `202`,
- rate limit blokuje nadmiar zgłoszeń per IP i per email,
- Turnstile jest sprawdzany przez `verifyTurnstileToken`,
- błędy zapisu są logowane po stronie serwera, a klient dostaje neutralny komunikat.

Rate limit jest in-memory i wystarcza jako lokalny fundament. Przy produkcyjnym ruchu warto podmienić go na trwały storage albo platformowy rate limit.

## Zapis

Serwerowy zapis jest w `src/server/leads/iod.ts`.

Na `main` nie ma docelowego modelu `Lead` z Phase 2R, dlatego Phase 4R używa istniejącego adaptera:

- `Organization` - nazwa z `contact.company`, a jeśli jej nie ma, z `contact.name`,
- `FormSubmission` z `formType = iod_checker_lead`,
- JSON `data` zawiera odpowiedzi, wynik, zgody, źródło, UTM i metadane requestu.

Pełne odpowiedzi z publicznego checkera są zapisywane jako `answers`. Dodatkowo serwer tworzy `normalizedAnswers`, żeby obecny widok CRM mógł nadal korzystać z prostych etykiet branży, skali i poziomu leada.

Wynik klientowy (`result`, `complianceResult`) jest zapisywany jako snapshot, ale serwer ponownie liczy autorytatywny wynik przez `evaluateIodObligation(mapLandingAnswersToObligationInput(...))`.

## Audyt I Blokady

Blokady są logowane przez `safeLogAuditEvent`:

- `lead.honeypot_blocked`
- `lead.rate_limit_blocked`
- `lead.turnstile_blocked`

Audyt jest best-effort: błąd zapisu logu nie blokuje odpowiedzi endpointu.

## Konfiguracja Turnstile

Turnstile używa `CLOUDFLARE_TURNSTILE_SECRET_KEY`.

W development brak sekretu nie blokuje formularza. W production brak sekretu albo tokenu powoduje odrzucenie zgłoszenia. Klucz nie może trafić do repozytorium; nazwę zmiennej należy dokumentować w `.env.example`, jeśli projekt zdecyduje się aktywować widget na froncie.
