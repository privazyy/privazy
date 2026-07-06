# SEO Content Engine

Faza 9R dodaje techniczny fundament SEO dla tresci z bazy.

## Publiczny blog

`/blog` oraz `/blog/[slug]` czytaja wpisy z `BlogPost`, ale zachowuja fallback do `src/lib/blog.ts`, gdy baza nie ma jeszcze migracji CMS.

Publiczne sa tylko:

- `PUBLISHED` z `publishedAt <= now`,
- `SCHEDULED` z `scheduledAt <= now`.

`DRAFT`, `IN_REVIEW`, przyszle `SCHEDULED` i `ARCHIVED` nie sa publiczne.

## Metadata

Wpis wspiera:

- `seoTitle`,
- `metaDescription`,
- `canonicalUrl`,
- `ogTitle`,
- `ogDescription`,
- `ogImage`,
- JSON-LD Article,
- JSON-LD FAQ, gdy istnieja `BlogFaqItem`.

Preview CMS ma `robots: noindex`.

## Sitemap i robots

`src/app/sitemap.ts` generuje sitemap z:

- strona glowna,
- `/blog`,
- sklep,
- kategorie bloga,
- tylko publiczne wpisy.

`src/app/robots.ts` blokuje `/admin`, `/admin/blog`, `/platforma` i `/api`.

## Kategorie i tagi

Dodane trasy:

- `/blog/kategoria/[slug]`,
- `/blog/tag/[slug]`.

Pokazuja tylko publiczne wpisy i nie indeksuja draftow przez przypadek.

## Konwersja

Wpis moze kierowac do:

- checkera IOD,
- sklepu,
- kontaktu/uslug,
- newslettera,
- konsultacji,
- powiazanych artykulow.

CTA nie obiecuje automatycznej zgodnosci z RODO.
