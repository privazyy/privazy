# Content Review Policy

Tresci prawne PRIVAZY nie sa publikowane automatycznie.

## Role

- `OPERATOR` moze tworzyc szkice i wysylac je do `IN_REVIEW`.
- `LAWYER` moze review, publikowac i planowac publikacje.
- `ADMIN` ma pelny dostep.
- `READ_ONLY` tylko czyta.

## Minimalne wymagania przed publikacja

Wpis musi miec:

- tytul,
- unikalny slug,
- excerpt,
- content,
- kategorie,
- meta description,
- disclaimer prawny,
- sensowne CTA albo `NONE`.

## Revisions i audit

Kazda istotna zmiana przez CMS tworzy:

- `BlogRevision` ze snapshotem,
- `AuditLog` z akcja `cms.blog.*`.

Publikacja i planowanie wpisu ustawia `reviewerId` na aktora, ktory wykonuje akcje.

## Zakazy

- Nie publikowac draftow bez review.
- Nie obiecywac indywidualnej porady prawnej.
- Nie tworzyc masowych stron thin content.
- Nie indeksowac preview.
- Nie uzywac AI-generated content bez review merytorycznego i prawnego.
