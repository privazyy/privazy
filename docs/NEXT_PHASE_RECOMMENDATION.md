# PRIVAZY — Next Phase Recommendation

## Current position

PRIVAZY stoi realnie na etapie bezpiecznego technicznie buildu, ale nie na etapie bezpiecznego produktu. `main` ma landing, blog, checker logic, publiczny CRM read model, podstawowe auth config i zalążek generatora dokumentów, ale nie ma ochrony prywatnych tras, realnego sklepu, checkoutu, płatności, faktur, portalu klienta ani produkcyjnych generatorów.

Fazy 0-8 istnieją głównie jako otwarte draft PR-y (#3-#10). Mają zielone checki, ale nie są częścią `main` i nie mogą być traktowane jako ukończony produkt.

## Do not continue before fixing

- Publiczny `/admin`.
- Publiczne `/api/crm/leads`.
- Publiczne `/api/documents/generate`.
- Brak `middleware.ts`/`src/proxy.ts` na `main`.
- Brak login page i seed admina.
- Brak role checks i organization ownership checks.
- Brak rate limitu i Turnstile dla formularzy publicznych.
- Brak audit log dla odmów dostępu i krytycznych mutacji.
- Brak decyzji o kolejności scalania migracji Phase 2/5/7/8.
- `responsive:check` failujący na `/admin` bez lokalnej bazy.

## Recommended next branch

`codex/phase-1-security-reconcile`

## Recommended next PR

`[security] reconcile auth blockers before feature phases`

## Recommended next scope

- Odtworzyć minimalny, produkcyjnie sensowny zakres Phase 1 na bazie `main`.
- Dodać login route i admin bootstrap bez sekretów w repo.
- Dodać `src/proxy.ts` albo aktualny odpowiednik ochrony tras dla Next.js.
- Chronić `/admin`, `/dashboard`, `/documents`, `/uploads`, `/client`/`/platforma`.
- Chronić `/api/crm/*`, `/api/documents/*`, przyszłe `/api/payments/*` i `/api/platforma/*`.
- Wprowadzić role checks dla `ADMIN`, `LAWYER`, `OPERATOR`, `CLIENT`, `READ_ONLY`.
- Dodać organization ownership checks dla dokumentów, jobów i danych klienta.
- Dodać rate limiting i Turnstile do publicznych formularzy.
- Dodać audit log dla denied access i podstawowych mutacji.
- Uaktualnić responsive check tak, aby prywatne route'y były testowane z kontrolowanym seedem albo w trybie auth-aware.

## Out of scope

- Realny checkout.
- Realne płatności.
- Faktury produkcyjne.
- Nowe moduły CRM.
- Portal klienta.
- Generatory produkcyjne i pobieranie dokumentów.
- CMS.
- Automatyzacje biznesowe.
- Production deploy.
- Redesign landingu lub CRM.
