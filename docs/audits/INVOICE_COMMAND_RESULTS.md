# Invoice Foundation Validation Results

Data walidacji: 2026-07-08.

## Komendy

| Komenda | Wynik |
| --- | --- |
| `npm ci` | PASS; 0 podatności zgłoszonych przez npm. |
| `npm run prisma:generate` | PASS. |
| `npx prisma validate` | PASS. |
| `npm run lint` | PASS. |
| `npm run typecheck` | PASS. |
| `npm run build` | PASS. |
| `npm run responsive:check` | PASS dla statusu ordera i checkout success, viewporty 360–2560 px. |

## Integracja

Wszystkie migracje uruchomiono od zera na izolowanym PGlite/Postgres.

| Scenariusz | Wynik |
| --- | --- |
| Tabele `Invoice`/`InvoiceEvent` | PASS; migracja i RLS aktywne. |
| Brak sesji | 401. |
| READ_ONLY issue | 403. |
| CLIENT, obca organizacja | 403 dla issue i odczytu. |
| Brak ordera | 404. |
| Order nieopłacony | 409, brak faktury. |
| Brak intencji faktury | 409. |
| CLIENT, własny paid order | 201, `ISSUED`, provider/mode MOCK. |
| Powtórne issue | 200, ten sam Invoice, bez duplikatu. |
| Staff issue | 201. |
| Buyer i totals | Zgodne z BillingProfile oraz Order. |
| InvoiceEvent | Jeden event na fakturę, tylko hash bez raw payloadu. |
| Serializer klienta | Brak external ID i provider payloadu. |
| `ENABLE_INVOICES=false` | 503. |
| `ENABLE_LIVE_INVOICES=true` | 409 fail-closed. |

Utworzone numery `MOCK/2026/000001` i `MOCK/2026/000002` są wyłącznie
wynikiem lokalnego testu. Nie uruchomiono migracji ani numeracji produkcyjnej.
