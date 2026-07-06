# Public Site Phase 4R

Phase 4R rozbudowuje publiczną część PRIVAZY na bazie `main`: landing, checker IOD, strony usług, strony branżowe, podstawy SEO i bezpieczne wejścia leadowe. Zakres nie obejmuje checkoutu, płatności, pełnego sklepu, portalu klienta, CMS, generatorów ani nowych funkcji CRM.

## Struktura

Główne wejścia publiczne:

- `/` - landing z checkerem IOD, ofertą, blogiem i kontaktem.
- `/sklep/polityka-prywatnosci` - zachowana strona produktu, ale bez udawanego checkoutu.
- `/uslugi/[slug]` - dynamiczne strony usług z `src/lib/public-site.ts`.
- `/branze/[slug]` - dynamiczne strony branż z `src/lib/public-site.ts`.
- `/blog` i `/blog/[slug]` - istniejący blog z linkowaniem do checkera, usług i branż.

Aktywne strony usług:

- `/uslugi/wdrozenie-rodo`
- `/uslugi/outsourcing-iod`
- `/uslugi/audyt-rodo`
- `/uslugi/dokumentacja-rodo`
- `/uslugi/naruszenia-ochrony-danych`
- `/uslugi/zadania-osob`

Aktywne strony branż:

- `/branze/placowki-medyczne`
- `/branze/szkoly-i-przedszkola`
- `/branze/ecommerce`
- `/branze/kancelarie`
- `/branze/hr-i-rekrutacja`
- `/branze/saas-i-it`

## Komponenty

Publiczne komponenty są w `src/components/public/`:

- `PublicPageShell`
- `PublicHero`
- `PublicSection`
- `ServiceCard`
- `IndustryCard`
- `ProcessSteps`
- `FaqSection`
- `TrustSection`
- `CtaBand`
- `LegalDisclaimer`
- `LeadCaptureForm`
- `RelatedLinks`
- `Breadcrumbs`

Komponenty korzystają z tokenów design-systemu i klas layoutowych projektu (`pvz-container`, `pvz-section`, `src/app/globals.css`). Nie wprowadzono nowej palety ani osobnego frameworka UI.

## Lead Flow

Są dwa publiczne endpointy:

- `POST /api/leads/iod` - wynik checkera IOD z pełnym snapshotem odpowiedzi, wyniku, zgód i źródła.
- `POST /api/leads/public` - formularze usług i branż z tematem, źródłem, UTM i zgodą.

Oba endpointy:

- walidują payload Zodem,
- nie zwracają szczegółów walidacji do klienta,
- mają in-memory rate limit per IP i per email,
- obsługują honeypot `security.website`,
- mają fundament Cloudflare Turnstile przez `security.turnstileToken`,
- zapisują dane w istniejących modelach `Organization` i `FormSubmission`.

`/api/leads/iod` używa `formType = iod_checker_lead`, a `/api/leads/public` używa `formType = public_site_lead`.

## Produkt Sklepu

`/sklep/polityka-prywatnosci` pozostaje publiczną stroną produktu i dokumentu. CTA zakupowe prowadzi teraz do kontaktu mailowego, bo w tym zakresie nie ma produkcyjnego checkoutu ani płatności. Strona wyjaśnia, że publiczny checkout online wróci dopiero po wdrożeniu koszyka i płatności.

## Poza Zakresem

Phase 4R celowo nie dodaje:

- checkoutu, koszyka ani płatności,
- pełnego sklepu,
- portalu klienta,
- panelu CMS,
- generatorów dokumentów,
- nowych modeli bazy danych,
- zmian w architekturze CRM.

## Responsywność

`scripts/check-responsive.mjs` obejmuje przykładowe nowe trasy:

- `/uslugi/outsourcing-iod`
- `/uslugi/dokumentacja-rodo`
- `/branze/ecommerce`
- `/branze/placowki-medyczne`

Zasady pozostają zgodne z `docs/DESIGN_SYSTEM.md` i `docs/RESPONSIVE.md`: brak poziomego overflow, stałe kontenery, responsywne siatki i tekst mieszczący się w komponentach.
