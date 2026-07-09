# PRIVAZY — Current State Audit

Data audytu: 2026-07-05
Branch audytu: `codex/current-state-audit`
Punkt odniesienia: `origin/main` (`0bea57c`, `implement landing crm and iod checker`)

## 1. Executive summary

Projekt nie jest gotowy do produkcji ani do częściowego startu biznesowego. Oficjalny `main` buduje się poprawnie i zawiera działający fundament Next.js, landing, statyczny blog, checker IOD po stronie UI, endpoint zapisu leadu IOD, publiczny CRM czytający dane z bazy, podstawowy model Prisma dla użytkowników, organizacji, dokumentów, jobów, formularzy i audit logu oraz zalążek generowania DOCX przez Inngest/R2.

Najważniejszy wniosek: dotychczasowe fazy 0-8 istnieją głównie jako otwarte draft PR-y, a nie jako zintegrowany produkt na `main`. PR-y #3-#10 mają zielone checki, ale pozostają draftami. Dlatego nie wolno traktować ich jako ukończonych faz produkcyjnych. `main` ma tylko część bazowej implementacji, a najpoważniejszym ryzykiem jest brak ochrony prywatnych tras i API.

Realnie gotowe są wyłącznie techniczne bramki kompilacji na `main`: `npm ci`, `prisma generate`, `prisma validate`, `lint`, `typecheck` i `build`. Nie ma fazy, którą można oznaczyć jako `DONE` w sensie produkcyjnym.

Największe ryzyka:

- publiczny `/admin` i publiczne `/api/crm/leads`,
- publiczne `/api/documents/generate` pozwalające tworzyć joby dla dowolnych identyfikatorów,
- brak `middleware.ts`/`src/proxy.ts` na `main`,
- brak role checks i organizacyjnej izolacji danych na trasach App Router,
- brak rate limitu i Turnstile na publicznych formularzach,
- schema `main` nie obejmuje sklepu, checkoutu, płatności, faktur, CRM 2.0, portalu klienta, CMS i automatyzacji,
- checker IOD w modalu pokazuje wynik, ale przycisk wysyłki wyniku na e-mail nie wysyła payloadu do API,
- brak realnego checkoutu, płatności, faktur, generatorów produkcyjnych, portalu klienta i stagingu.

Rekomendowany następny krok: nie kontynuować Phase 5+ jako funkcji. Najpierw wrócić do Phase 1 i zrobić mały PR bezpieczeństwa, który zamyka `/admin`, `/dashboard`, `/documents`, `/uploads`, `/client`/`/platforma`, prywatne API, dodaje seed/admin bootstrap, role checks, rate limiting/Turnstile i minimalny audit log dla dostępu.

## 2. Phase completion table

| Faza | Nazwa | Status | Szacunkowe ukończenie | Dowody w repo | Największe braki | Rekomendacja |
|------|-------|--------|-----------------------|---------------|------------------|--------------|
| 0 | Dokumentacja, audyt i architektura docelowa | PARTIAL | 35% | `docs/DESIGN_SYSTEM.md`, `docs/RESPONSIVE.md`, `docs/SETUP.md`, `docs/ENVIRONMENT.md`, `docs/IOD_CHECKER_COMPLIANCE_SPEC.md`; draft PR #3 dodaje `PRODUCT_SPEC`, `ARCHITECTURE_TARGET`, roadmapę i DoD | Na `main` brak pełnego product spec, architecture target, roadmapy faz i DoD | Wrócić i scalić/reconcile Phase 0 docs po obecnym audycie |
| 1 | Bezpieczeństwo, auth, role i ochrona tras | NEEDS_REWORK | 20% | `src/server/auth/config.ts`, `src/server/trpc/init.ts`, role Prisma; draft PR #4 dodaje guards/proxy/rate/Turnstile | Na `main` brak login page, proxy/middleware, route protection, API auth, role checks, seed admina, rate limitu | Blokuje dalszą pracę. Następny PR powinien być Phase 1 security reconcile |
| 2 | Docelowy model danych 2.0 | SCAFFOLDED | 30% | `prisma/schema.prisma`, `prisma/migrations/20260624212134_init`; draft PR #5 dodaje Phase 2 schema/migration/seed/docs | `main` ma tylko bazowe modele; brak shop/orders/payments/invoices/CRM cases/CMS/newsletter/automations | Nie budować nowych modułów na starym schema; najpierw uzgodnić i scalić model |
| 3 | Design system, UX i komponenty bazowe | PARTIAL | 35% | `docs/DESIGN_SYSTEM.md`, `docs/RESPONSIVE.md`, `src/app/globals.css`, `src/components/ui/*`; draft PR #6 dodaje wzorce UI | Na `main` brak pełnego inventory, modal/drawer/table/status patterns i stabilnych stanów błędu/loading | Kontynuować dopiero po security; komponenty scalać bez redesignu landing/CRM |
| 4 | Public site, landing, usługi, SEO foundation | PARTIAL | 40% | `/`, `/blog`, `/blog/[slug]`, `/sklep/polityka-prywatnosci`, `src/components/landing/privazy-landing.tsx`, `src/lib/blog.ts`; draft PR #7 dodaje usługi/branże/sitemap/robots | Na `main` brak `/uslugi`, `/branze`, sitemap, robots, realny formularz kontaktowy, newsletter, pełny SEO | Nie uruchamiać marketingu; po security scalić public-site PR i uzupełnić lead flows |
| 5 | Sklep, koszyk, checkout, płatności i faktury | SCAFFOLDED | 15% | `src/components/product/product-page.tsx`, `/sklep/polityka-prywatnosci`; draft PR #8 dodaje sklep/koszyk/checkout/mock payments/mock invoices | Na `main` brak `/sklep`, koszyka, checkoutu, orderów, payment provider, webhooków, faktur | Nie kontynuować bez Phase 1 i Phase 2; PR #8 traktować jako foundation, nie launch |
| 6 | Generatory dokumentów, formularze, DOCX/PDF/HTML, R2, panel dokumentów | PARTIAL | 25% | `/documents`, `src/components/forms/document-request-form.tsx`, `src/app/api/documents/generate/route.ts`, `src/server/documents/*`, `src/server/storage/r2.ts`, `src/server/inngest/*` | Publiczny formularz z raw IDs, brak auth/org checks, brak szablonów produkcyjnych, PDF nie skonfigurowany, brak HTML/ZIP/review/retry/download ACL | Zatrzymać rozwój generatorów do czasu auth, storage ACL i modelu template versioning |
| 7 | CRM operacyjny | PARTIAL | 25% | `/admin`, `src/components/crm/privazy-crm.tsx`, `src/server/crm/data.ts`; draft PR #9 dodaje operacyjne akcje/permissions/workflows | Na `main` CRM jest publiczny, głównie read-only, bez mutacji, bez role checks i paginacji; wiele modułów to puste sekcje zależne od brakujących tabel | Najpierw zamknąć dostęp do CRM, potem scalić CRM work tylko z realnymi backendami |
| 8 | Platforma klienta | SCAFFOLDED | 10% | `/client` placeholder; draft PR #10 dodaje `/platforma/*`, permissions i klienta | Na `main` brak portalu, izolacji organizacji, downloads, zamówień, naruszeń, żądań, wiadomości | Nie wpuszczać klientów; wrócić po auth/org permissions i Phase 2/5/7 |
| 9 | Blog/CMS, SEO content engine, marketing operations | PARTIAL | 20% | `/blog`, `/blog/[slug]`, `src/lib/blog.ts`, `src/components/blog/*` | Blog jest statyczny w kodzie; brak CMS, draft/review/published, redirectów, newslettera, legal review workflow | Nie migrować contentu bez modelu CMS i publikacji |
| 10 | Automatyzacje | SCAFFOLDED | 10% | `src/server/inngest/client.ts`, `src/server/inngest/functions.ts`, `/api/inngest` | Tylko `document/generate.requested`; brak event logów, retry policy w domenie, alertów, raportów, e-mail automations | Nie automatyzować biznesu przed stabilnym modelem i audit logiem |
| 11 | Testy, QA i security hardening | PARTIAL | 20% | `npm run lint`, `typecheck`, `build`, `scripts/check-responsive.mjs`, CI `repo-check.yml` | Brak testów unit/integration/e2e, brak testów uprawnień, płatności i generatorów; responsive fails na `/admin` bez DB | Utworzyć plan testów po zamknięciu Phase 1; dodać test script |
| 12 | Staging i production readiness | SCAFFOLDED | 15% | `vercel.json`, `supabase/config.toml`, `.github/workflows/*`, docs env/setup | Brak staging checklist, backupów, monitoring/alerts, runbook, migration plan, release gate | Nie wdrażać produkcji; wrócić dopiero po funkcjonalnym MVP i QA |

Otwarte fazowe PR-y:

| PR | Branch | Base | Status | Znaczenie dla audytu |
|----|--------|------|--------|----------------------|
| #3 `[phase-0] product architecture and implementation roadmap` | `codex/phase-0-product-architecture` | `main` | OPEN draft, green checks | Dokumentacja Phase 0 istnieje, ale nie jest na `main` |
| #4 `[phase-1] security auth roles and protected routes` | `codex/phase-1-security-auth` | `main` | OPEN draft, green checks | Ma najważniejsze fixy security, ale nie chroni obecnego `main` |
| #5 `[phase-2] target data model for shop crm platform and generators` | `codex/phase-2-data-model` | `main` | OPEN draft, green checks | Model 2.0 i migracja są draftem, nie bazą produkcyjną |
| #6 `[phase-3] design system components and ux foundation` | `codex/phase-3-design-system-ux` | `main` | OPEN draft, green checks | Komponenty DS nie są zintegrowane |
| #7 `[phase-4] public site services industries and seo foundation` | `codex/phase-4-public-site` | `main` | OPEN draft, green checks | Public site foundation nie jest na `main` |
| #8 `[phase-5] shop cart checkout payments and invoices foundation` | `codex/phase-5-shop-checkout-payments` | `main` | OPEN draft, green checks | Shop/checkout/payments foundation jest mock/foundation, nie launch |
| #9 `[phase-7] operational crm modules permissions and workflows` | `codex/phase-7-operational-crm` | `codex/phase-5-shop-checkout-payments` | OPEN draft, green checks | CRM prace zależą od Phase 5 branch, nie od `main` |
| #10 `[phase-8] client portal documents incidents requests and messages` | `codex/phase-8-client-portal` | `codex/phase-7-operational-crm` | OPEN draft, green checks | Portal klienta jest zależny od #8 i #9 |

## 3. Functional module audit

### A. Public site

Status: PARTIAL.

Gotowe na `main`:

- Landing `/` z pełnym układem marketingowym i inline checkerem w `src/components/landing/privazy-landing.tsx`.
- Statyczny blog `/blog` i `/blog/[slug]` z treścią z `src/lib/blog.ts`.
- Jedna strona produktu `/sklep/polityka-prywatnosci`.
- Design tokens i responsive formula w `globals.css`, `DESIGN_SYSTEM.md`, `RESPONSIVE.md`.

Braki:

- Brak `/uslugi/[slug]`, `/branze/[slug]`, `/sklep`, `/sklep/[slug]`, `/koszyk`, `/checkout` na `main`.
- Brak `src/app/sitemap.ts` i `src/app/robots.ts` na `main`.
- CTA w landingu i blogu częściowo prowadzą do anchorów lub `#`, a nie do realnych procesów.
- Sekcja "Wyślij wynik" w checkerze ma input e-mail i przycisk, ale brak `fetch`/submit handlera.
- Brak newsletter subscribe endpointu i zgód marketingowych po stronie publicznego UI.

Ryzyka:

- Public site obiecuje sklep, platformę i incydenty, których `main` nie obsługuje end-to-end.
- Kampanie SEO/paid mogłyby kierować użytkowników do niegotowych ścieżek.

Rekomendacja: nie startować publicznie. Najpierw zamknąć auth/security, potem scalić Phase 4 public-site PR i podłączyć realne formularze.

### B. Checker IOD

Status: PARTIAL.

Gotowe:

- Logika oceny w `src/lib/iod-checker.ts` i `src/lib/iod-obligation-checker.ts`.
- Specyfikacja compliance w `docs/IOD_CHECKER_COMPLIANCE_SPEC.md`.
- UI modala w `src/components/landing/privazy-landing.tsx`.
- Endpoint `POST /api/leads/iod` z walidacją Zod i zapisem do `Organization` + `FormSubmission`.
- Mapowanie leadów dla CRM w `src/server/leads/iod.ts`.

Braki:

- Modal checker na `main` nie wysyła wyniku/contact payloadu do `/api/leads/iod`.
- Brak testów jednostkowych dla scenariuszy z dokumentacji.
- Brak rate limitu i Turnstile.
- Brak jasnego consent/audit trail poza JSON-em w `FormSubmission`.
- Endpoint CRM leadów jest publiczny.

Rekomendacja: kontynuować dopiero po Phase 1. Checker logic jest wartościowy, ale flow lead capture wymaga spięcia UI -> API -> CRM pod ochroną.

### C. Auth/security

Status: NEEDS_REWORK.

Gotowe:

- NextAuth Credentials config w `src/server/auth/config.ts`.
- Role `UserRole` w Prisma.
- `protectedProcedure` w tRPC.

Braki krytyczne:

- Brak `/login` na `main`.
- Brak `middleware.ts`, `src/middleware.ts` lub `src/proxy.ts` na `main`.
- `/admin`, `/dashboard`, `/documents`, `/uploads`, `/client` są publiczne.
- `/api/crm/leads` i `/api/documents/generate` są publiczne.
- Brak role checks w route handlers.
- Brak organizacyjnej izolacji w `documentsRouter.listJobs`; zalogowany user może filtrować dowolny `organizationId`.
- Brak seed admina na `main`.
- Brak Turnstile i rate limiting.
- Brak ochrony downloadów dokumentów.

Draft PR #4 dodaje istotny kierunek: `src/proxy.ts`, guards, roles, rate limit, Turnstile, login i seed. To jednak nie jest zintegrowane z `main`.

Rekomendacja: Phase 1 jest blokująca. Nie rozwijać shop/CRM/portal przed scaleniem lub odtworzeniem security PR.

### D. Model danych

Status: SCAFFOLDED na `main`, PARTIAL w draftach.

Gotowe na `main`:

- `User`, `Organization`, `ClientProfile`.
- `DocumentTemplate`, `DocumentGenerationJob`, `GeneratedDocument`.
- `FormSubmission`, `AuditLog`.
- Jedna migracja inicjalna `prisma/migrations/20260624212134_init/migration.sql`.

Braki na `main`:

- Brak dedykowanych modeli lead/deal/contact.
- Brak products, variants, cart, orders, payments, invoices, coupons, refunds.
- Brak breach incidents i data subject requests.
- Brak document inputs/template versions/files/downloads/reviews.
- Brak CMS/blog/newsletter/automation models.
- Brak RLS/grant/migration notes dla Supabase Data API.

Draft PR #5 dodaje szeroki model 2.0 i migrację Phase 2. Draft PR-y #8-#10 dodają kolejne migracje dla shop/CRM/portal. Żaden z nich nie jest częścią `main`.

Rekomendacja: nie budować nowych procesów biznesowych na starym schema `main`; najpierw ustalić kolejność scalania migracji.

### E. Sklep

Status: SCAFFOLDED.

Gotowe:

- Jedna strona produktu `/sklep/polityka-prywatnosci`.
- Komponent produktowy `src/components/product/product-page.tsx`.
- Statyczne dane produktu w `src/lib/product.ts`.

Braki:

- Brak katalogu `/sklep`, koszyka, checkoutu, zamówień, statusów, kuponów, faktur i e-maili na `main`.
- Brak tabel shop/order/payment/invoice w schema `main`.
- Brak realnego flow od CTA do zakupu.

Draft PR #8 dodaje foundation, ale z mock payment/invoice providerami i bez realnego operatora płatności.

Rekomendacja: nie uruchamiać sprzedaży. Najpierw Phase 1/2, potem osobny PR sklepu z sandbox payment provider.

### F. Płatności

Status: NOT_STARTED na `main`, SCAFFOLDED w PR #8.

Na `main` brak:

- `PaymentProvider`,
- create payment,
- webhook,
- idempotencji płatności,
- walidacji kwot po stronie provider webhook,
- realnego dostawcy,
- faktur.

W PR #8 istnieje mock provider z częściową idempotencją i mock webhook secret, ale to nie jest provider produkcyjny.

Rekomendacja: nie przyjmować płatności. Następny realny etap płatności musi mieć sandbox docelowego providera, weryfikację webhooków, reconciliation i testy kwot/VAT.

### G. Generatory

Status: PARTIAL.

Gotowe:

- Formularz `/documents`.
- Endpoint `POST /api/documents/generate`.
- `requestDocumentGeneration`, `generateDocumentFromJob`.
- DOCX render przez `docxtemplater`.
- R2 upload/download helper.
- Inngest function `Generate document`.
- Audit log dla success/failure generowania.

Braki:

- Brak auth i org permissions.
- Formularz wymaga ręcznie wpisanych `organizationId`, `templateId`, `createdById`.
- Brak realnych seedów/szablonów produkcyjnych.
- PDF converter to `NotConfiguredPdfConverter`.
- Brak HTML preview, ZIP, signed download route, review/approval, retry UI, historia pobrań, e-maile.
- Brak testów generatora i storage.

Rekomendacja: zabezpieczyć API, dodać model wersji szablonów i download ACL przed dalszym rozwojem.

### H. CRM

Status: PARTIAL.

Gotowe:

- `/admin` renderuje `PrivazyCrm`.
- `src/server/crm/data.ts` czyta realne tabele Prisma i pokazuje liczniki, listy i puste moduły.
- CRM nie udaje danych demo w części modułów; wiele sekcji pokazuje brak tabel.

Braki:

- CRM jest publiczny.
- Brak mutacji, zadań, notatek, wiadomości, status workflows, role checks.
- Brak paginacji i filtrowania backendowego.
- Część KPI jest pochodna z ograniczonego schema, nie z docelowych procesów.
- Brak audit log dla dostępu i zmian CRM.

Draft PR #9 dodaje actions/permissions/workflows, ale zależy od PR #8 i nie jest na `main`.

Rekomendacja: najpierw zamknąć `/admin`, potem dopiero rozwijać operacyjny CRM.

### I. Platforma klienta

Status: SCAFFOLDED.

Gotowe na `main`:

- `/client` placeholder.

Braki:

- Brak `/platforma`.
- Brak dashboardu, dokumentów, zamówień, formularzy, naruszeń, żądań osób, wiadomości, zadań, ustawień organizacji.
- Brak organizacyjnej kontroli dostępu.
- Brak bezpiecznego pobierania dokumentów.

Draft PR #10 dodaje portal, ale jest zależny od PR #9/#8 i nadal draftem.

Rekomendacja: nie wpuszczać klientów do portalu przed pełną izolacją organizacji i testami access control.

### J. Blog/CMS

Status: PARTIAL.

Gotowe:

- Publiczny blog statyczny.
- Artykuły, kategorie i FAQ-like struktury w `src/lib/blog.ts`.
- Komponenty blogowe.

Braki:

- Brak CMS w CRM.
- Brak modelu `BlogPost`, kategorii, autorów, statusów draft/review/published.
- Brak preview, legal review, migracji starych artykułów, newslettera i FAQ schema jako systemu.
- Brak sitemap na `main`.

Rekomendacja: nie migrować contentu do CMS przed Phase 2/7 i public-site SEO PR.

### K. Automatyzacje

Status: SCAFFOLDED.

Gotowe:

- Inngest client i route.
- Jedna funkcja generowania dokumentu.

Braki:

- Brak automatyzacji CRM, przypomnień, alertów SLA, newslettera, retry management, raportów.
- Brak event store/workflow run models na `main`.
- Brak idempotency strategy poza pojedynczym `id` przy wysyłce Inngest.

Rekomendacja: automatyzacje dopiero po ustabilizowaniu modeli i audit logu.

### L. QA

Status: PARTIAL.

Gotowe:

- `npm ci`, `npm run prisma:generate`, `npm run lint`, `npm run typecheck`, `npm run build` przechodzą.
- `scripts/check-responsive.mjs` istnieje i sprawdza `/`, `/admin`, `/blog`, blog article i produkt.
- CI uruchamia build/lint/typecheck.

Braki:

- Brak `test` script.
- Brak testów unit/integration/e2e.
- Brak testów auth/permissions, generatorów i płatności.
- `responsive:check` failuje na `/admin`, gdy brak lokalnej bazy.

Rekomendacja: dodać testy po Phase 1; wcześniej responsive check powinien mieć tryb z auth/seed albo pomijać DB-only route w środowisku bez DB.

### M. Deployment

Status: SCAFFOLDED.

Gotowe:

- `vercel.json`.
- `supabase/config.toml`.
- `.env.example`, `docs/ENVIRONMENT.md`, `docs/SETUP.md`.
- GitHub Actions: `repo-check.yml`, `remote-ready.yml`.

Braki:

- Brak staging readiness.
- Brak produkcyjnego env validation.
- Brak backup/restore planu.
- Brak monitoring/alerts/runbook.
- Brak release checklist.
- Brak potwierdzonego Supabase migration status bez bazy.
- Brak Cloudflare R2/Resend/Inngest operational verification.

Rekomendacja: nie wdrażać produkcji. Deployment readiness dopiero po QA i pełnych integracjach sandbox/staging.

## 4. Security blockers

SECURITY_BLOCKERS:

1. `/admin` jest publiczny na `main` i renderuje dane CRM przez `getCrmDatabaseData()`.
2. `/api/crm/leads` jest publicznym GET-em bez sesji, roli i rate limitu.
3. `/api/documents/generate` jest publicznym POST-em. Waliduje payload, ale nie sprawdza sesji, roli, organizacji ani własności `templateId`/`createdById`.
4. `/documents` jest publicznym formularzem z ręcznie wpisywanymi identyfikatorami organizacji, szablonu i użytkownika.
5. Brak `middleware.ts`/`src/proxy.ts` na `main`; prywatne trasy nie mają route-level protection.
6. Brak `/login` i brak bootstrapu admina na `main`.
7. tRPC ma `protectedProcedure`, ale `documentsRouter.listJobs` nie ma sprawdzania dostępu do `organizationId`.
8. Brak Turnstile na lead/form endpoints.
9. Brak rate limiting dla publicznych endpointów.
10. Brak webhook verification dla przyszłych płatności na `main`; Inngest route polega na integracji biblioteki, ale brak dodatkowego audit/security doc w kodzie main.
11. `DocumentTemplate.fileKey`, `GeneratedDocument.docxFileKey`, `pdfFileKey`, `zipFileKey` istnieją w bazie; przy publicznym CRM mogą zostać pokazane operatorowi bez auth, a brak download ACL.
12. R2 helper tworzy signed URLs, ale nie ma chronionego endpointu pobierania z permission check.
13. Audit log obejmuje tylko część generatora; brak audit log dla logowania, odmów dostępu, CRM, leadów i API mutacji.
14. Brak Supabase RLS/grants w migracjach `main`; tabele w `public` schema wymagają osobnej decyzji Data API/RLS przed ekspozycją.
15. Brak server-side spam protection dla checkera i formularzy.

## 5. Business blockers

BUSINESS_BLOCKERS:

1. Brak realnego checkoutu na `main`.
2. Brak koszyka i zamówień na `main`.
3. Brak płatności i webhooków na `main`.
4. Brak faktur na `main`.
5. Brak realnego procesu wygenerowania dokumentu dla klienta od zakupu do pobrania.
6. Brak skonfigurowanego PDF convertera.
7. Brak portalu klienta i bezpiecznego dostępu do dokumentów.
8. Brak CRM workflow do obsługi zamówienia, dokumentu, naruszenia i żądania osoby.
9. Brak e-maili transakcyjnych podpiętych do publicznych flow na `main`.
10. Brak regulaminu sprzedaży i pełnych polityk prawnych dla checkoutu.
11. Brak treści prawnie sprawdzonych jako release package.
12. Brak stagingu i release checklist.
13. Checker nie zapisuje leadu z UI modala mimo istnienia endpointu.
14. Blog jest kodowy, bez procesu publikacji/review.
15. Produkcja częściowa w obecnym stanie grozi przyjęciem leadów/zapytań bez bezpiecznego procesu obsługi.

## 6. Technical blockers

TECHNICAL_BLOCKERS:

- Build przechodzi.
- Lint przechodzi.
- Typecheck przechodzi.
- Prisma generate przechodzi z placeholderami `DATABASE_URL` i `DIRECT_URL`.
- Prisma validate przechodzi.
- `prisma migrate status` nie potwierdzony, bo pod placeholderem brak lokalnego PostgreSQL na `localhost:5432`.
- `responsive:check` failuje na `/admin`, bo produkcyjny server próbuje odczytać CRM z bazy i dostaje `PrismaClientInitializationError: Can't reach database server at localhost:5432`.
- Brak `test` script w `package.json`.
- Brak testów permissions, API i generatorów.
- Brak migracji Phase 2+ na `main`.
- Brak runtime env validation; błędy R2/Resend pojawią się dopiero przy wywołaniu.
- Brak lokalnego seed/admin bootstrap na `main`.
- App Router build działa, ale prywatne route'y są statycznie/publicznie dostępne tam, gdzie powinny wymagać auth.

## 7. Build and command results

| Komenda | Status | Najważniejsze wyniki | Pliki/moduły | Rekomendacja |
|---------|--------|----------------------|--------------|--------------|
| `npm ci` | PASS | 683 packages installed, 0 vulnerabilities; ostrzeżenia o deprecated packages (`serialize-error-cjs`, `node-domexception`, `glob`) | `package-lock.json` | OK; wrócić do deprecated packages przy maintenance |
| `npm run prisma:generate` | PASS | Prisma Client v6.19.3 wygenerowany z placeholderami DB env | `prisma/schema.prisma` | OK; w CI/staging używać prawdziwych env |
| `npx prisma validate` | PASS | Schema valid | `prisma/schema.prisma` | OK |
| `npx prisma migrate status` | FAIL / NOT_VERIFIED | Schema engine error przy próbie połączenia z `localhost:5432`; brak lokalnej bazy pod placeholderem | `prisma/migrations/*` | Zweryfikować na połączonym Supabase/local Postgres przed scalaniem migracji |
| `npm run lint` | PASS | ESLint bez błędów | `src`, config | OK |
| `npm run typecheck` | PASS | `tsc --noEmit` bez błędów | TypeScript app | OK |
| `npm run build` | PASS | Next.js 16.2.9 build success; wygenerowano 21 static pages; dynamic: `/admin`, API routes | `src/app` | OK technicznie; nie oznacza production readiness |
| `npm test` | NOT_AVAILABLE | Brak `test` script w `package.json` | `package.json` | Dodać testy w Phase 11 |
| `npm run responsive:check` | FAIL | `/` przeszło wszystkie viewporty; `/admin mobile-360` fail z 500 i logiem Prisma `Can't reach database server at localhost:5432`; dodatkowy 404 asset | `scripts/check-responsive.mjs`, `/admin` | Dodać tryb testowy z bazą/seedem albo auth-safe responsive target |

## 8. Data model audit

Gotowe na `main`:

- Minimalny auth/user model: `User`, `UserRole`.
- Organizacje i profile klienta: `Organization`, `ClientProfile`.
- Dokumenty: `DocumentTemplate`, `DocumentGenerationJob`, `GeneratedDocument`.
- Formularze ogólne: `FormSubmission`.
- Audit log: `AuditLog`.

Nadmiarowe / ryzykowne na obecnym etapie:

- `DocumentTemplate.fileKey` jest wymagany, ale brak produkcyjnego admin/upload flow dla szablonów.
- `GeneratedDocument.docxFileKey` jest wymagany, ale brak chronionego download endpointu.
- `FormSubmission.data Json` niesie lead/contact/consent/result w jednym polu, co przy wzroście CRM utrudni filtrowanie, statusy i raporty.
- `AuditLog.metadata Json` jest użyteczne, ale brak polityki redakcji danych wrażliwych.

Braki:

- Brak dedykowanych tabel lead/contact/deal/pipeline.
- Brak produktów, wariantów, koszyka, orderów, paymentów, invoices, coupons, refunds.
- Brak incident/request/message/task models.
- Brak document input/template version/file/download/review/update models.
- Brak CMS/newsletter/marketing/automation models.
- Brak membership/invite/settings/billing profile w `main`.
- Brak migracji RLS/policies/grants.

Niespójności:

- UI CRM pokazuje wiele modułów docelowych, ale schema `main` nie ma ich tabel.
- Landing obiecuje platformę klienta i incydenty, ale schema `main` nie ma dedykowanych modeli.
- Document API oczekuje istniejących IDs, ale brak publicznego procesu ich uzyskania i permission check.

Ryzyka migracyjne:

- Otwarte draft PR-y dodają migracje niezależnymi branchami. Trzeba ustalić kolejność i potencjalne konflikty przed scaleniem.
- Supabase Data API/RLS musi być osobną decyzją przed wystawieniem tabel w public schema.
- `prisma migrate status` nie został potwierdzony bez bazy.

## 9. API and permissions audit

| Endpoint | Typ | Status ochrony | Walidacja | Role/org check | Audit log | Ocena |
|----------|-----|----------------|-----------|----------------|-----------|-------|
| `/api/auth/[...nextauth]` | Auth | Publiczny auth handler | NextAuth Credentials + Zod w config | Brak route-level policy poza NextAuth | Brak | OK jako fundament, ale brak login page/seed admin |
| `POST /api/leads/iod` | Public lead | Publiczny | Zod `iodLeadPayloadSchema` | Nie dotyczy publicznego leadu | Brak osobnego audit log, zapis w `FormSubmission` | PARTIAL; wymaga rate limit/Turnstile |
| `GET /api/crm/leads` | CRM | Publiczny | Brak input | Brak | Brak | SECURITY_BLOCKER |
| `POST /api/documents/generate` | Generator | Publiczny | Zod `documentGenerateApiSchema` | Brak | Success/failure audit dopiero w workerze | SECURITY_BLOCKER |
| `/api/inngest` GET/POST/PUT | Workflow | Handler Inngest | Biblioteka Inngest | Brak app-level role | Brak w route | PARTIAL; zależne od konfiguracji Inngest |
| `/api/trpc/[trpc]` | Internal API | Per procedure | Zod w routerach | `protectedProcedure`, ale brak org ownership check w documents router | Brak | PARTIAL |

Najpilniejsze poprawki API:

1. Dodać auth guard dla `/api/crm/*` i `/api/documents/*`.
2. Dodać role checks dla CRM i generatorów.
3. Dodać `organizationId` ownership check w tRPC i document services.
4. Dodać rate limit i Turnstile dla publicznych lead endpoints.
5. Dodać audit log dla denied access i mutacji.

## 10. UI route audit

| Trasa | Typ | Istnieje | Działa technicznie | Realne dane | Placeholder/mock | Chroniona | Ocena |
|-------|-----|----------|--------------------|-------------|------------------|-----------|-------|
| `/` | public | Tak | Tak | Częściowo, statyczne treści + checker logic | CTA do niegotowych ścieżek | Nie wymaga | PARTIAL |
| `/blog` | public | Tak | Tak | Statyczne z `src/lib/blog.ts` | Brak CMS | Nie wymaga | PARTIAL |
| `/blog/[slug]` | public | Tak | Tak | Statyczne artykuły | Brak CMS/review workflow | Nie wymaga | PARTIAL |
| `/sklep/polityka-prywatnosci` | public product | Tak | Tak | Statyczny produkt | Brak checkoutu | Nie wymaga | SCAFFOLDED |
| `/admin` | private CRM | Tak | Fail bez DB; działa z DB | Prisma read model | Część modułów pusta | Nie | SECURITY_BLOCKER |
| `/dashboard` | private | Tak | Tak | Nie | Placeholder nawigacyjny | Nie | SECURITY_BLOCKER |
| `/documents` | private/generator | Tak | Tak UI; API zależne od DB/R2/Inngest | Tworzy job po raw IDs | Formularz techniczny | Nie | SECURITY_BLOCKER |
| `/uploads` | private | Tak | Tak | Nie | Placeholder | Nie | SECURITY_BLOCKER |
| `/client` | private client portal | Tak | Tak | Nie | Placeholder | Nie | SECURITY_BLOCKER |
| `/api/auth/[...nextauth]` | API/auth | Tak | Tak | NextAuth | Brak UI login na main | Public auth | PARTIAL |
| `/api/leads/iod` | API/public | Tak | Tak z DB | Zapis leadu | Niepodłączony modal UI | Public | PARTIAL |
| `/api/crm/leads` | API/private | Tak | Tak z DB | Lead list | Nie | Nie | SECURITY_BLOCKER |
| `/api/documents/generate` | API/private | Tak | Tak z DB/R2/Inngest | Job generatora | Techniczne raw IDs | Nie | SECURITY_BLOCKER |
| `/api/inngest` | API/workflow | Tak | Zależne od env | Workflow route | Minimalny zakres | Nie app-level | PARTIAL |
| `/api/trpc/[trpc]` | API/internal | Tak | Tak | Documents router | Brak client surface | Proceduralnie częściowo | PARTIAL |

Nieistniejące na `main`, mimo że są w planie lub linkach:

- `/sklep`
- `/sklep/[slug]`
- `/koszyk`
- `/checkout`
- `/checkout/sukces`
- `/checkout/blad`
- `/zamowienie/[orderNumber]`
- `/platforma`
- `/platforma/dokumenty`
- `/platforma/naruszenia`
- `/platforma/zadania-osob`
- `/platforma/wiadomosci`
- `/uslugi/[slug]`
- `/branze/[slug]`
- `/robots.txt` przez `src/app/robots.ts`
- `/sitemap.xml` przez `src/app/sitemap.ts`

## 11. Recommended continuation plan

Kontynuować od: Phase 1 security/auth reconcile.

Trzeba wrócić do wcześniejszej fazy: tak. Phase 1 blokuje Phase 5, 6, 7 i 8. Otwarte PR-y fazowe są wartościowe, ale ich obecny układ nie daje jednej liniowej, produkcyjnie bezpiecznej bazy.

Najpilniejsze zadania:

1. Utworzyć branch `codex/phase-1-security-reconcile` z `main`.
2. Przenieść lub odtworzyć minimalny zakres z PR #4: login, proxy/middleware, guards, role map, seed admin, rate limit, Turnstile.
3. Zamknąć `/admin`, `/dashboard`, `/documents`, `/uploads`, `/client` i prywatne API.
4. Dodać server-side role checks i organization ownership checks.
5. Dodać audit log dla denied access i najważniejszych mutacji.
6. Podłączyć UI checkera do `/api/leads/iod` albo ukryć wysyłkę e-mail do czasu gotowości.
7. Zweryfikować `responsive:check` w trybie z bazą albo zmienić test tak, by prywatne route'y nie wymagały publicznej bazy.
8. Ustalić kolejność scalania PR-ów #3-#10 i migracji.
9. Po Phase 1 scalić Phase 0 docs, potem Phase 2 schema.
10. Dopiero potem wrócić do Phase 4/5/7/8.

Czego nie ruszać jeszcze:

- Realnych płatności.
- Produkcyjnego checkoutu.
- Produkcyjnych generatorów dla klientów.
- Publicznego portalu klienta.
- CMS migracji.
- Staging/production deploy.
- Redesignu UI.

Rekomendowane następne PR-y:

1. `[security] reconcile auth blockers before feature phases`
2. `[docs] merge product architecture and definition of done`
3. `[data] reconcile phase 2 schema and migration order`
4. `[public] wire IOD checker lead submission safely`
5. `[qa] add auth and permission regression tests`

## 12. Suggested next prompts

- `Fix auth blockers before Phase 5`
- `Reconcile Phase 0 docs with current audit`
- `Merge and verify Phase 2 data model migrations`
- `Wire IOD checker lead submit with Turnstile`
- `Add protected route and API permission tests`
- `Reconcile CRM shell with real database modules`
- `Prepare shop checkout sandbox only after security`
- `Design document generator ACL and download flow`
- `Create staging readiness checklist`
- `Plan PR sequencing for open phase branches`
