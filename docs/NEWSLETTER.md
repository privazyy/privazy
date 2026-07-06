# Newsletter

Faza 9R dodaje foundation newslettera bez kampanii masowych.

## Modele

- `NewsletterSubscriber` - email, status, zrodlo, UTM, zgoda i token wypisu.
- `NewsletterEvent` - signup, potwierdzenie, wypis i zmiany zgody.

Statusy:

- `PENDING`,
- `ACTIVE`,
- `UNSUBSCRIBED`,
- `BOUNCED`,
- `COMPLAINED`.

## Endpoint

`POST /api/newsletter/signup`

Wymaga:

- poprawnego emaila,
- jawnej zgody marketingowej,
- source,
- opcjonalnych UTM.

Endpoint zapisuje `NewsletterSubscriber`, `NewsletterEvent` i `MarketingEvent`. Brak Resend env nie blokuje developmentu; warstwa mailowa loguje skipped email.

## Wypis

`/newsletter/unsubscribe/[token]` oznacza subskrybenta jako `UNSUBSCRIBED` i zapisuje event.

## CRM

`/admin/newsletter` pokazuje liste subskrybentow. Nie ma kampanii masowych ani segmentacji wysylkowej w tej fazie.

## Przed produkcja

- dodac rate limit/Turnstile do publicznego endpointu,
- wdrozyc double opt-in,
- dopiac szablony maili,
- dodac polityke retencji i eksport zgody,
- przetestowac RLS/Data API jesli tabele beda dostepne przez Supabase API.
