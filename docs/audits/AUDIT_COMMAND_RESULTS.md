# Commerce Validation Results

Data walidacji: 2026-07-08.

## Komendy

| Komenda | Wynik |
| --- | --- |
| `npm ci` | PASS; 0 podatności zgłoszonych przez npm. |
| `npm run prisma:generate` | PASS. |
| `npx prisma validate` | PASS. |
| `npm run lint` | PASS. |
| `npm run typecheck` | PASS. |
| `npm run build` | PASS przy `ENABLE_CHECKOUT=false` i `ENABLE_LIVE_PAYMENTS=false`. |
| `npm run responsive:check` | PASS dla landing, katalogu, pakietów, strony produktu, koszyka, checkoutu i poprawnej strony mock payment; viewporty 360–2560 px. |

Repo nie ma runnera testów. Scenariusze z `COMMERCE_SMOKE_CHECKLIST.md`
wykonano integracyjnie na świeżej, izolowanej bazie PGlite/Postgres z Prisma:

| Scenariusz | Wynik |
| --- | --- |
| Migracja `init` + commerce | PASS; tabele utworzone, RLS aktywne na tabelach commerce. |
| Seed dziesięciu produktów | PASS. |
| Cena/VAT przesłane przez klienta | PASS; zignorowane, totals policzone z ceny w DB. |
| Produkt `ARCHIVED` | PASS; add-to-cart zwrócił 409. |
| Cart → checkout | PASS; order rozpoczął jako `PENDING_PAYMENT`. |
| Mock success | PASS; `Payment=SUCCEEDED`, `Order=PAID`. |
| Duplikat eventu | PASS; wynik `IGNORED`, bez ponownego księgowania. |
| Mismatch amount | PASS; event `REJECTED`, order pozostał `PENDING_PAYMENT`. |
| OrderItem bez template | PASS; po płatności pozostał `NOT_STARTED`. |
| OrderItem z aktywnym template | PASS; po płatności przeszedł do `READY_FOR_INPUT`, bez automatycznej generacji. |
| Checkout osoby fizycznej | PASS; `organizationId=null`. |
| `ENABLE_CHECKOUT=false` | PASS; publiczna mutacja zwróciła bezpieczne 503. |
| `ENABLE_LIVE_PAYMENTS=true` bez providera | PASS; checkout został zablokowany kodem 409. |
| Generator bez sesji staff | PASS; endpoint zwrócił 401, a `createdById` nie jest przyjmowane z payloadu. |

Manualny pass we wbudowanej przeglądarce nie był dostępny w tej sesji:
backend przeglądarki nie został udostępniony. Repozytoryjny headless responsive
check sprawdził treść, overlaye, błędy konsoli i poziomy overflow.
