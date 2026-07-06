# SEO Foundation

Phase 4R dodaje podstawowy fundament SEO dla publicznego serwisu PRIVAZY bez CMS i bez generowania treści runtime.

## Metadata

Globalne metadata są w `src/app/layout.tsx`:

- `metadataBase` z `NEXT_PUBLIC_SITE_URL` albo `https://privazy.pl`,
- domyślny tytuł i template,
- opis publicznej oferty,
- Open Graph `siteName`, `locale` i `type`.

Landing, blog, strony usług i strony branż mają własne metadata, canonical i Open Graph.

## Indeksowanie

Dodane pliki:

- `src/app/sitemap.ts`
- `src/app/robots.ts`

Sitemap obejmuje:

- `/`,
- `/blog`,
- `/sklep/polityka-prywatnosci`,
- wszystkie strony usług,
- wszystkie strony branż,
- artykuły blogowe.

Robots pozwala indeksować publiczne trasy i blokuje obszary aplikacyjne oraz API:

- `/admin`
- `/dashboard`
- `/client`
- `/api`

## Dane Strukturalne

Strony usług zawierają:

- `Service` JSON-LD,
- `FAQPage` JSON-LD,
- `BreadcrumbList` JSON-LD.

Strony branż zawierają:

- `FAQPage` JSON-LD,
- `BreadcrumbList` JSON-LD.

FAQ widoczne na stronie jest tym samym źródłem danych, które trafia do JSON-LD.

## Linkowanie Wewnętrzne

Public site linkuje między:

- landingiem i checkerem,
- usługami,
- branżami,
- blogiem,
- stroną produktu `/sklep/polityka-prywatnosci`.

Każda strona usługi i branży ma powiązane linki, rekomendowane usługi albo branże oraz CTA do checkera lub kontaktu.

## Ograniczenia

Nie dodano CMS, automatycznej publikacji treści ani pełnego systemu canonical helperów. Dane stron publicznych są statyczne w `src/lib/public-site.ts`, dzięki czemu zakres Phase 4R pozostaje bezpieczny i zgodny z obecnym App Routerem.
