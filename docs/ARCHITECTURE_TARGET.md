# PRIVAZY - architektura docelowa

Status dokumentu: faza 0, dokumentacja i audyt.
Zakres: docelowa architektura dla pełnej platformy, bez wdrażania zmian produkcyjnych.

## 1. Zasady architektury

- Next.js App Router jako główny framework aplikacji.
- Server Components dla danych i ekranów prywatnych, Client Components tylko dla interakcji.
- Route Handlers dla webhooków, publicznych API i integracji zewnętrznych.
- tRPC lub server actions dla wewnętrznych, typowanych operacji aplikacji.
- Prisma jako warstwa ORM nad PostgreSQL/Supabase.
- Cloudflare R2 jako prywatny storage plików.
- Inngest dla długich procesów i automatyzacji.
- Resend dla e-maili transakcyjnych.
- Bramka płatności i system faktur jako osobne integracje.
- Wszędzie audyt, role i separacja danych organizacji.

## 2. Podział aplikacji Next.js

### Public site

Route'y:

- `/`
- `/blog`
- `/blog/[slug]`
- `/sklep/[slug]`
- docelowo strony branżowe i produktowe.

Odpowiedzialność:

- marketing,
- SEO,
- content,
- checker IOD,
- formularze leadowe,
- prezentacja pakietów i dokumentów.

Renderowanie:

- statyczne lub ISR dla contentu,
- Client Components tylko dla checkera, filtrów i interakcji.

### Shop

Route'y docelowe:

- `/sklep`
- `/sklep/[productSlug]`
- `/koszyk`
- `/checkout`
- `/checkout/success`
- `/checkout/cancel`

Odpowiedzialność:

- katalog produktów,
- ceny,
- warianty,
- koszyk,
- checkout,
- płatności,
- zgody i dane fakturowe,
- utworzenie zamówienia.

### CRM

Route'y:

- `/admin`
- docelowo `/admin/[module]` lub routing po state/URL.

Odpowiedzialność:

- leady,
- sprzedaż,
- klienci,
- zamówienia,
- dokumenty,
- naruszenia,
- żądania osób,
- outsourcing IOD,
- zadania,
- raporty,
- administracja.

Wymagania:

- tylko role wewnętrzne,
- brak publicznego dostępu,
- route-level auth i API auth,
- pełny audit log.

### Platforma klienta

Route'y docelowe:

- `/client`
- `/client/documents`
- `/client/incidents`
- `/client/requests`
- `/client/messages`
- `/client/settings`

Odpowiedzialność:

- dostęp klienta do własnej organizacji,
- dokumenty,
- formularze danych,
- naruszenia,
- żądania osób,
- komunikacja z IOD,
- statusy spraw,
- pobieranie plików przez podpisane URL-e.

### Blog/CMS

Obecnie blog jest kodowy. Docelowo potrzebny jest moduł CMS:

- modele postów,
- kategorie,
- autorzy,
- wersje,
- status publikacji,
- SEO metadata,
- preview,
- publikacja i unpublish,
- powiązanie z lead capture i newsletterem.

### Generatory

Generatory powinny być osobnym bounded context:

- szablony,
- wersje szablonów,
- schematy danych,
- joby,
- pliki wynikowe,
- review/approval,
- retry,
- logi błędów,
- audyt.

## 3. Docelowe warstwy backendu

### Warstwa route/API

- `src/app/api/*/route.ts`
- Obsługuje request/response, walidację wejścia, auth, rate limit i mapowanie błędów.
- Nie powinna zawierać logiki biznesowej poza koordynacją.

### Warstwa server services

- `src/server/*`
- Logika domenowa: leads, documents, CRM, payments, invoices, incidents, requests.
- Każdy service przyjmuje zwalidowany input i zwraca typowany wynik.

### Warstwa persistence

- Prisma client przez `getPrisma()` z lazy initialization.
- Brak bezpośrednich zapytań z Client Components.
- Każdy query prywatny musi uwzględniać role i `organizationId`.

### Warstwa automatyzacji

- Inngest functions dla procesów długich:
  - generowanie dokumentu,
  - wysyłka e-maila,
  - webhook płatności,
  - przypisanie leadu,
  - terminy naruszeń,
  - raporty cykliczne.

### Warstwa integracji

- Storage R2.
- Resend.
- Płatności.
- Faktury.
- Analityka.
- Monitoring.

Integracje muszą mieć lazy initialization, jasne błędy konfiguracji i testowe tryby.

## 4. Model API

### Public API

- `POST /api/leads/iod` - zapis leadu z checkera.
- `POST /api/contact` - kontakt ogólny.
- `POST /api/newsletter/subscribe` - newsletter.
- `POST /api/checkout/session` - start checkoutu.
- `POST /api/webhooks/payments` - webhook płatności.
- `POST /api/webhooks/invoices` - webhook faktur.

Publiczne API musi mieć walidację, rate limit, ochronę przed spamem i brak wycieku szczegółów błędów.

### Internal API

- `/api/crm/*`
- `/api/documents/*`
- `/api/client/*`
- `/api/admin/*`

Internal API musi wymagać sesji, roli i autoryzacji organizacji.

### Workflow API

- `/api/inngest`
- Dostęp zabezpieczony zgodnie z wymaganiami Inngest i sekretami środowiskowymi.

## 5. Model auth i ról

Obecny stan:

- NextAuth Credentials istnieje w `src/server/auth/config.ts`.
- Role istnieją w Prisma: `ADMIN`, `LAWYER`, `OPERATOR`, `CLIENT`, `READ_ONLY`.
- tRPC ma `protectedProcedure`.
- Brakuje ochrony route'ów App Router i route handlers.

Docelowy model:

- `ADMIN` - pełna administracja systemem.
- `LAWYER` - sprawy prawne, IOD, naruszenia, żądania, review dokumentów.
- `OPERATOR` - obsługa leadów, zamówień, dokumentów, statusów.
- `CLIENT` - dostęp tylko do własnej organizacji i własnych spraw.
- `READ_ONLY` - audyt, raporty, podgląd bez mutacji.

Zasady:

- Proxy/middleware może przekierować niezalogowanych, ale nie jest jedynym mechanizmem bezpieczeństwa.
- Każdy Server Component prywatny i każdy Route Handler musi ponownie walidować sesję i rolę.
- Każdy dostęp klienta musi sprawdzać `organizationId`.
- Operacje wrażliwe wymagają audit logu.

## 6. Docelowy model danych

Obecny schema obejmuje:

- `User`,
- `Organization`,
- `ClientProfile`,
- `DocumentTemplate`,
- `DocumentGenerationJob`,
- `GeneratedDocument`,
- `AuditLog`,
- `FormSubmission`.

Docelowo potrzebne są dodatkowe obszary danych:

- contacts,
- leads/deals,
- products,
- product variants,
- cart/checkout sessions,
- orders,
- payments,
- invoices,
- subscriptions,
- document template versions,
- document variables/schema versions,
- document reviews,
- incident cases,
- data subject requests,
- tasks,
- messages,
- comments,
- notifications,
- newsletter subscribers,
- campaigns,
- blog posts/categories/authors,
- automation rules/runs,
- report definitions,
- file objects/access grants,
- consent records,
- integration events,
- webhook events.

Każdy model z danymi klienta powinien mieć:

- `organizationId` tam, gdzie dotyczy,
- status,
- timestamps,
- właściciela lub autora,
- indeksy pod listy CRM,
- audit trail lub powiązanie z `AuditLog`.

## 7. Integracje zewnętrzne

### Supabase/PostgreSQL

Rola:

- główna baza danych przez PostgreSQL,
- migracje Prisma,
- runtime connection przez pooled `DATABASE_URL`,
- direct connection przez `DIRECT_URL` dla migracji.

Zasady:

- nie commitować sekretów,
- `service_role` tylko server-side,
- dla tabel dostępnych przez Supabase Data API stosować RLS,
- nie opierać autoryzacji na user-editable metadata,
- każda tabela klienta musi wspierać izolację organizacji.

### Cloudflare R2

Rola:

- prywatne szablony DOCX,
- wygenerowane dokumenty,
- paczki ZIP,
- uploady klientów.

Zasady:

- pliki prywatne domyślnie,
- pobieranie przez krótkie signed URL,
- klucze plików deterministyczne, ale niezgadywalne dla użytkownika,
- audit log dla upload/download/generate.

### Resend

Rola:

- e-maile transakcyjne,
- potwierdzenia leadów,
- linki do dokumentów,
- powiadomienia o statusie,
- zaproszenia do platformy,
- newsletter tylko po zgodzie.

Zasady:

- wersjonowane szablony,
- log wysyłki,
- retry,
- obsługa bounce/spam complaint,
- brak danych wrażliwych w temacie e-maila.

### Inngest

Rola:

- workflowy dokumentów,
- webhook processing,
- automatyzacje CRM,
- retry i observability.

Zasady:

- idempotency keys,
- statusy jobów w bazie,
- retry tylko dla operacji bezpiecznych lub idempotentnych,
- błędy zapisywane w CRM.

### Bramka płatności

Rola:

- checkout,
- płatności jednorazowe,
- subskrypcje,
- webhooks.

Zasady:

- webhook jako źródło prawdy płatności,
- idempotentna obsługa eventów,
- brak wydania dokumentu przed potwierdzeniem płatności albo ręczną akceptacją.

### Faktury

Rola:

- wystawianie dokumentów sprzedaży,
- powiązanie z zamówieniem,
- status wysyłki do klienta.

Zasady:

- integracja po webhook/API,
- audyt zmian,
- korekty jako osobne rekordy.

### Analityka

Rola:

- ruch,
- konwersje,
- źródła leadów,
- funnel checkoutu,
- content performance.

Zasady:

- consent mode,
- brak wysyłki danych wrażliwych do narzędzi analitycznych,
- zdarzenia biznesowe agregowane.

### Monitoring

Rola:

- runtime errors,
- build/deploy checks,
- queue/workflow failures,
- webhook failures,
- uptime,
- latency,
- storage errors.

Zasady:

- alerty dla błędów płatności, dokumentów, auth i webhooków,
- dashboard release readiness,
- logi bez sekretów.

## 8. Polityka dostępu do plików

- Szablony DOCX są prywatne i dostępne tylko dla ról wewnętrznych.
- Wygenerowane dokumenty są prywatne i przypisane do organizacji.
- Klient może pobrać tylko pliki swojej organizacji.
- Pobranie odbywa się przez signed URL z krótkim TTL.
- Każde pobranie pliku prywatnego zapisuje audit log.
- Usunięcie pliku wymaga soft-delete rekordu i zachowania śladu audytu.

## 9. Model audytu

Audyt musi obejmować:

- logowanie i wylogowanie,
- zmianę ról,
- dostęp do dokumentów,
- pobranie pliku,
- utworzenie i zmianę leadu,
- utworzenie zamówienia,
- płatność i fakturę,
- generowanie dokumentu,
- review dokumentu,
- zgłoszenie naruszenia,
- decyzję IOD,
- odpowiedź na żądanie osoby,
- wysyłkę e-maila,
- webhooki i automatyzacje.

Audit log powinien zawierać:

- userId,
- organizationId,
- action,
- entityType,
- entityId,
- metadata bez sekretów,
- IP i user agent, jeśli dotyczy,
- timestamp.

## 10. Zasady bezpieczeństwa

- Żadne sekrety nie trafiają do repo.
- `.env.example` zawiera tylko nazwy i placeholdery.
- Client Components nie importują server-only helperów.
- Service role i klucze storage tylko po stronie serwera.
- Route Handlers prywatne zawsze sprawdzają sesję, rolę i organizację.
- Mutacje wymagają walidacji Zod.
- Webhooki wymagają weryfikacji podpisu.
- Uploady mają limit rozmiaru i typów.
- Dokumenty prawne i dane klientów są prywatne domyślnie.
- Błędy publiczne nie ujawniają stack trace ani konfiguracji.
- CI uruchamia lint, typecheck, build i secret check.
- Przed produkcją wymagane są staging, backupy, monitoring i runbook incident response.
