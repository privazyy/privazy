# Invoice Smoke Checklist

Repo nie ma runnera testów. Minimalna walidacja:

| Scenariusz | Oczekiwany wynik |
| --- | --- |
| Brak ordera | 404, bez raw Prisma error. |
| Order nieopłacony | 409, brak Invoice. |
| Brak intencji faktury | 409. |
| Kwoty przesłane przez klienta | Brak takich pól API; snapshot pochodzi z Order. |
| CLIENT, obca organizacja | 403. |
| READ_ONLY issue | 403. |
| Brak sesji | 401. |
| Paid order + zgodna płatność | `REQUESTED -> ISSUED`, provider/mode MOCK. |
| Powtórne issue | Ten sam Invoice, brak duplikatu. |
| Buyer snapshot | Zgodny z BillingProfile. |
| Totals | Zgodne z Order i constraintem brutto. |
| Client serializer | Brak raw payloadu, external ID i stack trace. |
| `ENABLE_INVOICES=false` | Issue zwraca 503. |
| `ENABLE_LIVE_INVOICES=true` | Fail-closed, brak live invoice. |
| UI/CRM | Jawne „faktura testowa / sandbox”, brak przycisku PDF bez pliku. |
