# PRIVAZY - definition of done

Status dokumentu: faza 0.
Cel: ustalić warunki, których spełnienie jest wymagane przed uznaniem produktu lub modułu za gotowy.

## Zasady nadrzędne

- "Build przechodzi" nie oznacza gotowości produkcyjnej.
- Moduł jest gotowy dopiero, gdy ma UI, backend, dane, auth, błędy, testy i audyt.
- Funkcja prywatna nie jest gotowa, jeśli nie ma sprawdzenia sesji, roli i organizacji.
- Funkcja dokumentowa nie jest gotowa, jeśli nie ma kontroli dostępu do plików.
- Funkcja płatna nie jest gotowa, jeśli webhook nie jest idempotentny.
- Makieta musi być oznaczona albo ukryta.

## Cały produkt

Produkt jest gotowy, gdy:

- public site, sklep, checkout, CRM i platforma klienta działają end-to-end,
- wszystkie prywatne route'y i API są chronione,
- wszystkie kluczowe modele danych istnieją w Prisma i mają migracje,
- lead z checkera trafia do CRM,
- zakup tworzy zamówienie, płatność, fakturę i job dokumentu,
- generator tworzy DOCX/PDF/HTML z wersjonowanego szablonu,
- klient może pobrać tylko własne pliki,
- naruszenia i żądania osób mają terminy, statusy i historię,
- e-maile mają szablony, logi i retry,
- workflowy mają statusy, retry i monitoring,
- audyt obejmuje operacje wrażliwe,
- CI, testy i staging są zielone,
- release checklist i rollback są opisane,
- nie ma realnych sekretów w repo.

Wymagane testy produktu:

- lint,
- typecheck,
- build,
- responsive,
- unit,
- integration,
- e2e,
- access control,
- webhook sandbox,
- post-deploy smoke na stagingu.

## Public site

Gotowe, gdy:

- landing renderuje się na wszystkich viewportach z `docs/RESPONSIVE.md`,
- CTA prowadzą do realnych ścieżek,
- checker zapisuje lead albo jasno działa tylko jako demo,
- formularze mają walidację, zgody i stany błędów,
- SEO metadata, title, description i canonical są kompletne,
- analityka działa zgodnie ze zgodami,
- treści nie obiecują niedostępnych funkcji jako gotowych.

Nie gotowe, jeśli:

- przyciski prowadzą do `#` bez dalszej akcji,
- wynik checkera nie może trafić do CRM,
- formularz kontaktowy nie zapisuje ani nie wysyła danych.

## Sklep

Gotowe, gdy:

- produkty i pakiety są w modelu danych,
- ceny i warianty nie są wyłącznie zakodowane w UI,
- katalog, produkt i koszyk mają spójne statusy,
- koszyk zachowuje stan i waliduje dostępność,
- każdy produkt jest powiązany z generatorem albo usługą,
- CRM widzi produkty i zamówienia.

Nie gotowe, jeśli:

- strona produktu jest tylko marketingowa,
- nie ma koszyka,
- nie da się utworzyć zamówienia.

## Checkout

Gotowe, gdy:

- checkout działa w sandboxie bramki płatności,
- webhook płatności jest zweryfikowany i idempotentny,
- zamówienie zmienia status tylko po potwierdzonym evencie,
- obsłużone są success, cancel i failed payment,
- klient dostaje potwierdzenie e-mail,
- CRM widzi płatność i zamówienie,
- kwoty, waluty i VAT są testowane.

Nie gotowe, jeśli:

- frontend zakłada płatność bez webhooka,
- dokument jest wydawany przed potwierdzeniem płatności,
- nie ma obsługi duplikatów webhooka.

## Generatory

Gotowe, gdy:

- każdy generator ma wersjonowany szablon,
- każdy szablon ma schema danych i walidację,
- job ma statusy `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`,
- output DOCX i PDF są zapisane w prywatnym storage,
- klient dostaje signed URL tylko do własnego dokumentu,
- błędy są widoczne w CRM,
- operator może wykonać review lub retry,
- audit log zapisuje wygenerowanie, pobranie i błędy.

Nie gotowe, jeśli:

- endpoint generowania jest publiczny,
- storage jest publiczny,
- nie ma wersji szablonu lub input snapshotu,
- brak testu pliku wynikowego.

## CRM

Gotowe, gdy:

- `/admin` wymaga sesji i odpowiedniej roli,
- wszystkie listy krytyczne są zasilane z backendu,
- makietowe moduły są ukryte albo oznaczone,
- rekordy mają detail view,
- mutacje mają walidację i audit,
- filtry i paginacja działają po stronie backendu,
- błędy danych mają czytelne stany,
- role ograniczają dostęp do akcji.

Nie gotowe, jeśli:

- statyczne dane wyglądają jak produkcyjne,
- brak ochrony `/admin`,
- listy pokazują dane bez sprawdzania roli.

## Platforma klienta

Gotowe, gdy:

- `/client` wymaga sesji klienta,
- klient widzi tylko własną organizację,
- dokumenty są pobierane przez signed URL,
- klient może zgłosić naruszenie,
- klient może obsłużyć żądanie osoby lub zlecić je IOD,
- wiadomości mają historię,
- każda akcja klienta jest audytowana,
- UI ma jasne statusy i terminy.

Nie gotowe, jeśli:

- route jest placeholderem,
- nie ma izolacji organizacji,
- pliki można pobrać bez sprawdzenia uprawnień.

## Blog/CMS

Gotowe, gdy:

- posty są w CMS albo bazie,
- są statusy draft/review/published/archived,
- jest preview chroniony auth,
- slug jest unikalny,
- metadata SEO generują się z danych,
- istnieje plan redirectów,
- treści prawne mają review.

Nie gotowe, jeśli:

- każda zmiana treści wymaga deploya,
- nie ma preview,
- autorzy/kategorie są tylko w kodzie.

## Bezpieczeństwo

Gotowe, gdy:

- auth chroni route'y i API,
- role są egzekwowane na serwerze,
- klient jest izolowany po `organizationId`,
- uploady i downloady są prywatne,
- webhooki mają podpisy,
- rate limit obejmuje publiczne formularze,
- audit obejmuje operacje wrażliwe,
- `.env.example` nie zawiera realnych wartości,
- dependency audit i CI są zielone,
- błędy publiczne nie ujawniają sekretów ani stack trace.

Nie gotowe, jeśli:

- proxy/middleware jest jedyną warstwą auth,
- publiczne API mutuje dane bez sesji albo rate limit,
- `service_role` lub sekrety są dostępne w kliencie.

## Deployment

Gotowe, gdy:

- istnieje staging odseparowany od produkcji,
- env vars są zarządzane przez Vercel/Supabase/GitHub secrets,
- migracje są testowane przed produkcją,
- backup i restore są sprawdzone,
- monitoring ma alerty,
- webhooki są testowane w sandboxie,
- release checklist jest wykonana,
- rollback jest opisany,
- post-deploy smoke test przechodzi.

Nie gotowe, jeśli:

- nie ma stagingu,
- nie ma monitoringu,
- nie ma procedury rollback,
- produkcja zależy od lokalnego `.env.local`.
