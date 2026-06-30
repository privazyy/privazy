# PRIVAZY - audyt modułów

Status dokumentu: faza 0.
Źródło: aktualna struktura repo, Prisma schema, route'y, komponenty, docs i workflowy.

## Build / Technical blockers

Aktualny wynik audytu z 2026-06-30:

- `npm run lint` - OK.
- `npm run typecheck` - OK po ponownym uruchomieniu po buildzie.
- `npm run build` - OK, Next.js 16.2.9 wygenerował 21 stron.

Notatka: pierwsze równoległe uruchomienie `npm run typecheck` wystartowało zanim `next build` odtworzył pliki `.next/types` i zwróciło brak `.next/types/routes.js`. Po zakończeniu builda `npm run typecheck` przeszedł bez błędów. Nie ma aktualnego blockera kompilacji w kodzie aplikacji.

## Priorytety

- P0 - blocker przed produkcją lub podstawowym MVP.
- P1 - wymagane przed pełnym MVP.
- P2 - ważne dla skalowania i jakości.

## 1. Landing

Obecny stan: istnieje publiczna strona `/` oparta o `src/components/landing/privazy-landing.tsx`. Zawiera ofertę, checker, pakiety, platformę, blog i CTA.

Status docelowy: pełny public site z mierzalnymi ścieżkami konwersji, formularzami, SEO i integracją CRM.

Braki:

- CTA częściowo prowadzą do kotwic albo `#`.
- Brak pełnego zapisu kontaktu z modalu.
- Brak analityki konwersji i consent mode.

Ryzyka:

- użytkownik może wykonać akcję UI bez zapisu w backendzie.
- treści mogą sugerować gotową platformę, której backend jeszcze nie ma.

Priorytet: P0.

Wymagane modele Prisma: `Lead`, `Contact`, `ConsentRecord`, `CampaignAttribution`, docelowo `PageEvent`.

Wymagane API: `POST /api/leads/iod`, `POST /api/contact`, `POST /api/analytics/event`.

Wymagane ekrany: landing, formularz kontaktowy, strony branżowe, strony produktów.

Wymagane testy: responsive, e2e CTA, integration lead submit, SEO metadata.

## 2. Checker IOD

Obecny stan: logika oceny istnieje w `src/lib/iod-checker.ts` i `src/lib/iod-obligation-checker.ts`; landing liczy wynik po stronie klienta. Istnieje dokument `docs/IOD_CHECKER_COMPLIANCE_SPEC.md`.

Status docelowy: produkcyjny checker z zapisem wyniku, zgód, źródła i historii kwalifikacji w CRM.

Braki:

- landing nie wywołuje API leadów.
- brak pełnej ścieżki zgód i kontaktu.
- brak testów jednostkowych przypadków z dokumentu compliance.

Ryzyka:

- wynik informacyjny bez lead capture.
- błędne mapowanie odpowiedzi do reżimu prawnego bez testów.

Priorytet: P0.

Wymagane modele Prisma: `IodAssessment`, `Lead`, `ConsentRecord`, `Organization`.

Wymagane API: `POST /api/leads/iod`, docelowo `POST /api/iod/assess`.

Wymagane ekrany: wizard checkera, wynik, zapis kontaktu, CRM lead detail.

Wymagane testy: unit reguł, integration API, e2e checker -> CRM.

## 3. Lead capture

Obecny stan: `POST /api/leads/iod` tworzy `Organization` i `FormSubmission` z danymi leadu. CRM listuje leady z `FormSubmission`.

Status docelowy: osobny model lead/deal/contact z pełną historią i źródłem.

Braki:

- brak dedykowanych modeli `Lead`, `Contact`, `Deal`.
- brak deduplikacji organizacji po NIP/e-mail.
- brak rate limit i antyspam.
- brak integracji landing -> API.

Ryzyka:

- duplikaty organizacji,
- spam w CRM,
- utrata źródła kampanii.

Priorytet: P0.

Wymagane modele Prisma: `Lead`, `Contact`, `Deal`, `CampaignAttribution`, `ConsentRecord`.

Wymagane API: `POST /api/leads/iod`, `GET /api/crm/leads`, `PATCH /api/crm/leads/:id`.

Wymagane ekrany: lista leadów, detail, kwalifikacja.

Wymagane testy: walidacja Zod, deduplikacja, CRM list, permission checks.

## 4. Sklep

Obecny stan: istnieje strona produktu `/sklep/polityka-prywatnosci`; w CRM produkty są częściowo z `DocumentTemplate`.

Status docelowy: katalog dokumentów i pakietów z koszykiem, cenami, wariantami i checkoutem.

Braki:

- brak modelu produktu i ceny.
- brak koszyka.
- brak checkoutu.
- brak relacji produkt -> szablony -> generatory.

Ryzyka:

- nie da się sprzedać produktu end-to-end.
- ceny i zakres mogą być zakodowane w UI.

Priorytet: P0.

Wymagane modele Prisma: `Product`, `ProductVariant`, `Price`, `Cart`, `OrderItem`, `DocumentTemplate`.

Wymagane API: `GET /api/shop/products`, `POST /api/cart`, `POST /api/checkout/session`.

Wymagane ekrany: katalog, produkt, koszyk.

Wymagane testy: ceny, warianty, dostępność, responsive.

## 5. Checkout

Obecny stan: brak checkoutu.

Status docelowy: bezpieczny checkout z płatnością, zgodami, danymi fakturowymi i utworzeniem zamówienia.

Braki:

- brak route'ów checkoutu.
- brak bramki płatności.
- brak webhooków płatności.
- brak faktur.

Ryzyka:

- utrata zamówień lub podwójne płatności bez idempotencji.
- wydanie dokumentu bez potwierdzenia płatności.

Priorytet: P0.

Wymagane modele Prisma: `CheckoutSession`, `Order`, `OrderItem`, `Payment`, `Invoice`, `WebhookEvent`.

Wymagane API: `POST /api/checkout/session`, `POST /api/webhooks/payments`.

Wymagane ekrany: koszyk, checkout, success, cancel, status płatności.

Wymagane testy: sandbox payment, webhook idempotency, kwoty/VAT.

## 6. Płatności

Obecny stan: brak implementacji.

Status docelowy: płatności jednorazowe i docelowo subskrypcje dla outsourcingu/platformy.

Braki:

- brak wybranej bramki.
- brak statusów płatności.
- brak reconciliation.

Ryzyka:

- błędne statusy zamówień,
- duplikaty eventów,
- brak obsługi zwrotów.

Priorytet: P0.

Wymagane modele Prisma: `Payment`, `PaymentEvent`, `Refund`, `Subscription`.

Wymagane API: webhooki płatności, endpoint checkoutu, status płatności.

Wymagane ekrany: status płatności, CRM payment detail.

Wymagane testy: idempotencja webhooków, failed payment, refund.

## 7. Faktury

Obecny stan: CRM księgowość jest pustym modułem, bo brak tabel faktur i płatności.

Status docelowy: integracja fakturowa powiązana z zamówieniem i płatnością.

Braki:

- brak modeli faktur.
- brak dostawcy faktur.
- brak wysyłki faktury.

Ryzyka:

- brak zgodności księgowej,
- niespójność kwot z płatnością.

Priorytet: P1.

Wymagane modele Prisma: `Invoice`, `InvoiceLine`, `InvoiceEvent`.

Wymagane API: `POST /api/invoices`, webhook dostawcy faktur.

Wymagane ekrany: faktury w CRM, szczegóły zamówienia.

Wymagane testy: VAT, kwoty, webhook, korekta.

## 8. Generatory dokumentów

Obecny stan: istnieją modele `DocumentTemplate`, `DocumentGenerationJob`, `GeneratedDocument`, service generowania DOCX, R2 helpery i Inngest function.

Status docelowy: pełny system generatorów DOCX/PDF/HTML z review, wersjami i portalem klienta.

Braki:

- brak gotowych szablonów produkcyjnych w repo.
- brak UI wyboru szablonu przez klienta.
- brak PDF pipeline w service.
- brak ochrony `POST /api/documents/generate`.
- brak signed URL flow w UI.

Ryzyka:

- generowanie dokumentu bez uprawnień,
- brak pliku w R2,
- brak wersji schematu danych,
- brak review prawnego.

Priorytet: P0.

Wymagane modele Prisma: obecne modele plus `DocumentReview`, `DocumentVariableSchema`, `FileObject`, `DownloadEvent`.

Wymagane API: `POST /api/documents/generate`, `GET /api/documents/:id/download`, `PATCH /api/documents/:id/review`.

Wymagane ekrany: formularz generatora, job status, review, download.

Wymagane testy: render DOCX, R2 signed URL, Inngest retry, access control.

## 9. CRM

Obecny stan: `/admin` renderuje `PrivazyCrm` z danymi z `getCrmDatabaseData`; część modułów jest oparta o Prismę, część pusta z komunikatem "brak tabeli".

Status docelowy: operacyjny CRM dla zespołu PRIVAZY.

Braki:

- brak ochrony route `/admin`.
- brak dedykowanych modeli dla wielu modułów.
- brak mutacji CRM.
- część badge'y i modułów pochodzi ze statycznych danych.
- szczegóły rekordów są ograniczone.

Ryzyka:

- publiczny dostęp do danych operacyjnych,
- mylenie makiet z funkcjami,
- brak paginacji i filtrów backendowych.

Priorytet: P0.

Wymagane modele Prisma: wszystkie domenowe modele CRM wymienione w architekturze.

Wymagane API: `/api/crm/*` z auth/roles.

Wymagane ekrany: dashboard, listy, details, edit forms, audit.

Wymagane testy: RBAC, listy, mutacje, responsive.

## 10. Platforma klienta

Obecny stan: `/client` jest placeholderem; landing pokazuje prezentacyjne UI platformy.

Status docelowy: bezpieczny portal organizacji klienta.

Braki:

- brak ekranów dokumentów, naruszeń, żądań i wiadomości.
- brak izolacji organizacji.
- brak download flow.

Ryzyka:

- IDOR/BOLA,
- wyciek dokumentów,
- brak obsługi użytkowników organizacji.

Priorytet: P0.

Wymagane modele Prisma: `ClientMembership`, `FileObject`, `Incident`, `DataSubjectRequest`, `Message`, `Task`.

Wymagane API: `/api/client/*`.

Wymagane ekrany: dashboard, dokumenty, naruszenia, żądania, wiadomości.

Wymagane testy: klient A/B access, signed URL, e2e portal.

## 11. Naruszenia

Obecny stan: CRM pokazuje brak tabeli naruszeń.

Status docelowy: pełny case management naruszeń ochrony danych.

Braki:

- brak modelu incydentu.
- brak terminów 72h.
- brak decyzji IOD.
- brak zgłoszeń do UODO/osób.

Ryzyka:

- brak dowodu należytej staranności,
- przekroczenie terminów,
- brak historii decyzji.

Priorytet: P0.

Wymagane modele Prisma: `Incident`, `IncidentEvent`, `IncidentAssessment`, `IncidentNotification`, `Task`.

Wymagane API: `/api/incidents/*`.

Wymagane ekrany: lista, detail, timeline, assessment, notifications.

Wymagane testy: SLA 72h, permissions, audit, workflow.

## 12. Żądania osób

Obecny stan: CRM filtruje request-like `FormSubmission`, ale brak dedykowanego modelu.

Status docelowy: obsługa DSAR z terminami, weryfikacją i odpowiedziami.

Braki:

- brak modelu żądania.
- brak weryfikacji tożsamości.
- brak terminów i szablonów odpowiedzi.

Ryzyka:

- przekroczenie terminu,
- odpowiedź bez weryfikacji,
- brak audytu.

Priorytet: P1.

Wymagane modele Prisma: `DataSubjectRequest`, `IdentityVerification`, `RequestResponse`, `Task`.

Wymagane API: `/api/requests/*`.

Wymagane ekrany: lista, detail, response builder.

Wymagane testy: terminy, statusy, access control.

## 13. Outsourcing IOD

Obecny stan: landing prezentuje ofertę; CRM moduł jest pusty z brakiem tabeli abonamentów IOD.

Status docelowy: abonament i obsługa stała IOD.

Braki:

- brak modelu subskrypcji/abonamentu.
- brak przypisania IOD.
- brak SLA i raportów okresowych.

Ryzyka:

- brak operacyjnej kontroli nad klientami abonamentowymi.

Priorytet: P1.

Wymagane modele Prisma: `DpoSubscription`, `DpoAssignment`, `ServiceLevel`, `PeriodicReport`.

Wymagane API: `/api/outsourcing/*`.

Wymagane ekrany: abonamenty, detail, raporty, SLA.

Wymagane testy: role IOD, SLA, raport.

## 14. Blog/CMS

Obecny stan: blog działa z danych kodowych w `src/lib/blog.ts`; CRM mówi, że treści blogowe nie są tabelą bazy danych.

Status docelowy: CMS z publikacją i SEO.

Braki:

- brak modeli postów.
- brak edytora.
- brak workflow publikacji.
- brak newsletter integration.

Ryzyka:

- content wymaga deploya,
- brak preview,
- trudna praca SEO.

Priorytet: P1.

Wymagane modele Prisma: `BlogPost`, `BlogCategory`, `Author`, `SeoMetadata`, `Redirect`.

Wymagane API: `/api/cms/*`.

Wymagane ekrany: lista postów, edytor, preview.

Wymagane testy: slug, metadata, publication status.

## 15. Newsletter

Obecny stan: formularze UI istnieją w blogu, ale brak backendu newslettera; CRM moduł newsletter jest pusty.

Status docelowy: lista subskrybentów, zgody, kampanie i wysyłki.

Braki:

- brak modelu subskrybenta.
- brak double opt-in.
- brak integracji wysyłki.

Ryzyka:

- wysyłka bez zgody,
- brak unsubscribe.

Priorytet: P2.

Wymagane modele Prisma: `NewsletterSubscriber`, `NewsletterCampaign`, `EmailEvent`, `ConsentRecord`.

Wymagane API: `POST /api/newsletter/subscribe`, unsubscribe endpoint.

Wymagane ekrany: CRM newsletter, kampanie.

Wymagane testy: opt-in, unsubscribe, consent.

## 16. E-maile

Obecny stan: istnieje helper Resend `sendDocumentsReadyEmail`, ale brak systemu szablonów i logów.

Status docelowy: transakcyjny system e-maili z logami, retry i szablonami.

Braki:

- brak modeli email log/template.
- brak kolejkowania.
- brak bounce handling.

Ryzyka:

- utrata powiadomień,
- duplikaty,
- brak śladu wysyłki.

Priorytet: P1.

Wymagane modele Prisma: `EmailTemplate`, `EmailLog`, `EmailEvent`.

Wymagane API: service layer plus webhooks Resend, jeśli używane.

Wymagane ekrany: log e-maili w CRM.

Wymagane testy: render template, send mock, retry.

## 17. Automatyzacje

Obecny stan: Inngest obsługuje generowanie dokumentu; CRM moduł automatyzacji jest pusty.

Status docelowy: workflow engine dla leadów, dokumentów, SLA, e-maili i raportów.

Braki:

- brak modeli workflow run.
- brak UI konfiguracji.
- brak alertów błędów.

Ryzyka:

- niewidoczne błędy retry,
- duplikaty operacji.

Priorytet: P1.

Wymagane modele Prisma: `AutomationRule`, `AutomationRun`, `IntegrationEvent`.

Wymagane API: `/api/automations/*`, Inngest handlers.

Wymagane ekrany: lista automatyzacji, run detail.

Wymagane testy: idempotencja, retry, failure path.

## 18. Raporty

Obecny stan: CRM moduł raportów jest pusty, brak tabel zapisanych raportów.

Status docelowy: raporty operacyjne, sprzedażowe, SLA i IOD.

Braki:

- brak definicji raportów.
- brak eksportów.
- brak harmonogramów.

Ryzyka:

- decyzje biznesowe na niepełnych danych.

Priorytet: P2.

Wymagane modele Prisma: `ReportDefinition`, `ReportRun`, `ReportFile`.

Wymagane API: `/api/reports/*`.

Wymagane ekrany: dashboard raportów, export.

Wymagane testy: agregacje, permissions, export.

## 19. Auth/security

Obecny stan: NextAuth Credentials i role istnieją, ale brak ochrony prywatnych route'ów i route handlers. tRPC ma protected procedure.

Status docelowy: pełne RBAC/organization isolation.

Braki:

- brak route guardów.
- brak API guardów dla dokumentów i CRM.
- brak sprawdzania organizacji klienta.
- brak rate limit.

Ryzyka:

- publiczny dostęp do CRM,
- IDOR,
- nieautoryzowane generowanie dokumentów.

Priorytet: P0.

Wymagane modele Prisma: obecne `User`, `ClientProfile`, docelowo `RolePermission`, `SessionAudit`.

Wymagane API: auth helpers, protected route wrappers.

Wymagane ekrany: login, access denied, admin users.

Wymagane testy: RBAC, API unauthorized, organization isolation.

## 20. Deployment/monitoring

Obecny stan: GitHub Actions uruchamia setup checks, Prisma generate, lint, typecheck i build. Repo jest przygotowane pod Vercel/Supabase, ale nie wykonujemy deploya w tej fazie.

Status docelowy: staging, production readiness, monitoring, alerts, rollback.

Braki:

- brak opisanej checklisty release.
- brak monitoringu aplikacyjnego w repo.
- brak post-deploy smoke.
- brak backup/restore test.

Ryzyka:

- wdrożenie bez obserwowalności,
- brak reakcji na błędy płatności/generatorów.

Priorytet: P0 przed produkcją.

Wymagane modele Prisma: `DeploymentEvent` opcjonalnie, `IntegrationEvent`, `AuditLog`.

Wymagane API: health checks, internal diagnostics.

Wymagane ekrany: status/monitoring w CRM albo panelu ops.

Wymagane testy: CI, staging smoke, webhook smoke, backup restore.
