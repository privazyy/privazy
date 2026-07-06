# CMS Blog

Faza 9R przenosi blog PRIVAZY ze statycznego zrodla `src/lib/blog.ts` do modelu CMS opartego o Prisma.

## Modele

- `BlogPost` - wpis, status, SEO, disclaimer, CTA i terminy publikacji.
- `BlogCategory` - kategoria publiczna i metadata.
- `BlogTag` oraz `BlogPostTag` - tagowanie.
- `BlogRevision` - snapshot istotnej zmiany.
- `BlogFaqItem` - FAQ do JSON-LD.
- `BlogCta` - dodatkowe CTA.
- `BlogRelatedProduct` i `BlogRelatedService` - powiazania konwersyjne.

## Workflow

Statusy:

- `DRAFT` - niepubliczny szkic.
- `IN_REVIEW` - wyslany do review prawnego.
- `SCHEDULED` - zaplanowany, publiczny dopiero po `scheduledAt`.
- `PUBLISHED` - publiczny i w sitemap.
- `ARCHIVED` - niepubliczny i poza sitemap.

Kazdy zapis przez CMS tworzy `BlogRevision` oraz `AuditLog`.

## Role

- `ADMIN` - pelny dostep, publikacja i archiwizacja.
- `LAWYER` - review i publikacja tresci prawnych.
- `OPERATOR` - drafty i wysylka do review, bez publikacji.
- `READ_ONLY` - podglad bez edycji.
- `CLIENT` - brak dostepu do CMS.

## Migracja starych artykulow

`src/lib/blog.ts` pozostaje fallbackiem developerskim. Skrypt:

```bash
npm run cms:seed-blog
```

tworzy kategorie startowe i upsertuje publiczne wpisy na podstawie dotychczasowych slugow. Seed jest idempotentny: istniejący slug nie tworzy duplikatu.

## Trasy CMS

- `/admin/blog` - lista wpisow.
- `/admin/blog/new` - nowy wpis.
- `/admin/blog/[id]/edit` - edycja.
- `/admin/blog/[id]/preview` - chroniony preview, `noindex`.

## Ograniczenia

- Brak ciezkiego rich text editora; edytor uzywa prostego markdown.
- Rollback z revision jest foundation/TODO.
- Zalaczniki i asset manager dla OG image sa poza zakresem.
- Supabase RLS/Data API wymaga osobnego review przed produkcja.
