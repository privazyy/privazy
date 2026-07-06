# Marketing Events

Faza 9R dodaje server-side foundation zdarzen marketingowych bez cookie-based tracking.

## Model

`MarketingEvent` przechowuje:

- typ,
- opcjonalny `postId`,
- opcjonalny `actorId`,
- source,
- referrer,
- UTM,
- metadane JSON,
- timestamp.

Typy:

- `ARTICLE_VIEW`,
- `CTA_CLICK`,
- `NEWSLETTER_SIGNUP`,
- `CHECKER_START_FROM_ARTICLE`,
- `PRODUCT_CLICK_FROM_ARTICLE`,
- `LEAD_FROM_ARTICLE`.

## Zakres Fazy 9R

Newsletter signup zapisuje `NEWSLETTER_SIGNUP`. Pozostale typy sa przygotowane w modelu i dokumentacji jako foundation pod kolejne kroki.

## Prywatnosc

- Nie zbieramy nadmiernych danych osobowych.
- Nie dodajemy cookie marketingowych.
- UTM i referrer sa opcjonalne.
- Email w marketing event nie jest zapisywany wprost; endpoint newslettera zapisuje tylko domenę w metadanych eventu.

## Przed produkcja

- uzgodnic consent mode,
- opisac retencje eventow,
- dodac agregaty zamiast szerokiego dostepu do raw eventow,
- zweryfikowac RLS/Data API w Supabase.
