# Commerce Security

- Ceny, VAT, waluta i totals są liczone server-side.
- Klient nie może przesłać `PAID`, `paymentStatus`, ceny ani `organizationId`.
- Koszyk jest identyfikowany HttpOnly/SameSite cookie; DB przechowuje hash.
- Checkout i wszystkie mutacje mają Zod oraz safe errors.
- Publiczne mutacje mają best-effort rate limit bez zapisywania surowego IP.
- Status `PAID` powstaje tylko w transakcji obsługi eventu.
- Webhook ma idempotency key, payload hash i amount/currency check.
- Raw payload, dane karty, sekrety i stack trace nie są zapisywane ani zwracane.
- `Payment.providerPayload` zawiera tylko minimalne dane mock (`eventId`, `mode`).
- Orders są dostępne publicznie wyłącznie przez parę order number + silny token.
- Publiczny checkout nie uruchamia generatora. Istniejący endpoint generowania
  działa wyłącznie jako jawny override dla ról `ADMIN`, `LAWYER` i `OPERATOR`;
  `createdById` pochodzi z sesji, nigdy z payloadu klienta.
- Tabele commerce mają RLS i revoked Data API grants; aplikacja używa Prisma server-side.
- Live payments są wyłączone i nie mają implementacji.
- Faktury, realne płatności i produkcyjny sklep pozostają poza zakresem.

In-memory rate limit nie jest wystarczającym rozproszonym limitem dla wielu
instancji Vercel. Przed stagingiem należy wdrożyć współdzielony store oraz
dedykowane automatyczne testy security.
