# Public Site

Phase 4 rozbudowuje publiczna część PRIVAZY bez zmiany rdzenia aplikacji CRM, dokumentów i checkera IOD.

## Cele

- utrzymać landing jako główne wejście do checkera IOD, dokumentów i outsourcingu,
- dodać indeksowalne strony usług oraz branż,
- poprawić wewnętrzne linkowanie między landingiem, blogiem, usługami, branżami i sklepem,
- zbierać leady z publicznych formularzy z informacją o źródle, UTM i zgodzie na kontakt,
- dodać podstawy SEO: metadata, canonical, Open Graph, sitemap, robots, FAQ schema, Service schema i breadcrumbs.

## Strony usług

Dynamiczny route: `src/app/uslugi/[slug]/page.tsx`.

Źródło danych: `src/lib/public-site.ts`.

Aktywne adresy:

- `/uslugi/wdrozenie-rodo`
- `/uslugi/outsourcing-iod`
- `/uslugi/audyt-rodo`
- `/uslugi/dokumentacja-rodo`
- `/uslugi/naruszenia-ochrony-danych`
- `/uslugi/zadania-osob`

Każda strona zawiera:

- hero z CTA do kontaktu i checkera IOD,
- sekcję problemów, efektów i zakresu,
- proces krok po kroku,
- FAQ z JSON-LD,
- Service schema,
- breadcrumbs z JSON-LD,
- formularz leadowy z kontekstem usługi.

## Strony branż

Dynamiczny route: `src/app/branze/[slug]/page.tsx`.

Aktywne adresy:

- `/branze/placowki-medyczne`
- `/branze/szkoly-i-przedszkola`
- `/branze/ecommerce`
- `/branze/kancelarie`
- `/branze/hr-i-rekrutacja`
- `/branze/saas-i-it`

Każda strona zawiera:

- ryzyka typowe dla branży,
- obowiązki do uporządkowania,
- kontekst obowiązku IOD,
- rekomendowane usługi,
- FAQ z JSON-LD,
- breadcrumbs z JSON-LD,
- formularz leadowy z kontekstem branży.

## Formularze leadowe

Komponent: `src/components/public/lead-capture-form.tsx`.

Endpoint: `src/app/api/leads/public/route.ts`.

Serwerowy zapis: `src/server/leads/public.ts`.

Formularz zbiera:

- imię i nazwisko,
- e-mail,
- telefon opcjonalnie,
- firmę,
- NIP opcjonalnie,
- wiadomość opcjonalnie,
- zgodę na kontakt,
- źródło strony, placement, usługę lub branżę,
- parametry UTM oraz `gclid`, `fbclid`, `msclkid`,
- opcjonalny kontekst checkera IOD.

Dane są zapisywane w istniejących modelach `Organization` i `FormSubmission` jako `formType = public_site_lead`. Nie dodano nowych tabel ani migracji.

## Checker IOD

Landing nadal używa istniejącego silnika:

- `mapLandingAnswersToObligationInput`,
- `evaluateIodObligation`,
- wynik z `obligation_status`, `primary_trigger`, skalą, brakami informacji i pytaniem kontrolnym.

Zmiana Phase 4 dotyczy warstwy leadowej: blok wyniku checkera używa teraz publicznego formularza, który zapisuje wynik, odpowiedzi, źródło i zgodę.

## SEO

Dodane elementy:

- `metadataBase` i domyślne Open Graph w `src/app/layout.tsx`,
- canonical i Open Graph dla home, bloga, usług i branż,
- `src/app/sitemap.ts`,
- `src/app/robots.ts`,
- FAQ schema i breadcrumbs na stronach usług oraz branż,
- Service schema na stronach usług.

Domyślny publiczny URL to `https://privazy.pl`, nadpisywany przez `NEXT_PUBLIC_SITE_URL`.

## Responsywność

`scripts/check-responsive.mjs` sprawdza teraz również przykładowe strony:

- `/uslugi/outsourcing-iod`
- `/uslugi/dokumentacja-rodo`
- `/branze/ecommerce`
- `/branze/placowki-medyczne`

Zasady pozostają zgodne z `docs/DESIGN_SYSTEM.md` i `docs/RESPONSIVE.md`: `pvz-container`, `pvz-section`, brak poziomego overflow oraz tokeny z `src/app/globals.css`.
