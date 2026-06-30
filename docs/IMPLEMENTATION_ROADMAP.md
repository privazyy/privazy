# PRIVAZY - roadmapa wdrożenia

Status dokumentu: faza 0.
Cel: zaplanować budowę pełnej platformy bez przedwczesnego wdrożenia produkcyjnego.

## Zasady prowadzenia roadmapy

- Każda faza kończy się działającym, testowalnym zakresem.
- Nie wypuszczamy produkcji częściowej, jeśli narusza bezpieczeństwo, prywatność lub integralność procesów.
- Zmiany UI muszą respektować `docs/DESIGN_SYSTEM.md` i `docs/RESPONSIVE.md`.
- Zmiany danych muszą mieć migracje, indeksy, audit i plan rollbacku.
- Zmiany integracyjne muszą mieć tryb testowy, idempotencję i monitoring.

## Faza 0: dokumentacja i audyt

Cel: ustalić stan obecny, produkt docelowy, architekturę, braki i kryteria gotowości.

Zakres:

- audyt `src/app`, `src/components`, `src/lib`, `src/server`, Prisma, docs, env i CI,
- dokumentacja produktu,
- architektura target,
- roadmapa,
- audyt modułów,
- definition of done.

Zależności:

- aktualny branch `main`,
- obecne docs design systemu i responsywności.

Pliki/moduły do zmiany:

- `docs/PRODUCT_SPEC.md`,
- `docs/ARCHITECTURE_TARGET.md`,
- `docs/IMPLEMENTATION_ROADMAP.md`,
- `docs/MODULE_AUDIT.md`,
- `docs/DEFINITION_OF_DONE.md`.

Definicja ukończenia:

- dokumenty istnieją,
- komendy `npm run lint`, `npm run typecheck`, `npm run build` są uruchomione,
- ewentualne blokery są zapisane w `docs/MODULE_AUDIT.md`.

Ryzyka:

- plan może być zbyt szeroki bez priorytetów,
- makiety mogą zostać pomylone z funkcjonalnością produkcyjną.

Testy:

- lint,
- typecheck,
- build.

Czego nie robić:

- nie implementować nowych funkcji,
- nie wdrażać produkcji,
- nie dodawać sekretów.

## Faza 1: bezpieczeństwo i auth

Cel: zamknąć prywatne route'y i API przed dalszą rozbudową.

Zakres:

- route-level auth dla `/admin`, `/dashboard`, `/documents`, `/uploads`, `/client`,
- auth guard dla API CRM, documents, client i admin,
- role-based access control,
- organizacyjna izolacja danych,
- logowanie operacji wrażliwych,
- podstawowy ekran logowania, jeśli brak produkcyjnego UX.

Zależności:

- obecny NextAuth Credentials,
- role Prisma,
- decyzja o modelu użytkowników klienta i zespołu.

Pliki/moduły do zmiany:

- `src/server/auth/*`,
- `src/app/api/*`,
- prywatne `src/app/*/page.tsx`,
- `src/server/trpc/*`,
- potencjalnie `src/proxy.ts` lub route-level guards.

Definicja ukończenia:

- niezalogowany użytkownik nie widzi CRM i API prywatnych,
- klient nie może czytać danych innej organizacji,
- role blokują niedozwolone akcje,
- testy auth pokrywają happy path i odmowę dostępu.

Ryzyka:

- poleganie wyłącznie na proxy/middleware,
- brak sprawdzenia `organizationId`,
- brak seed/admin bootstrap.

Testy:

- unit dla guardów,
- integration dla route handlers,
- e2e logowanie i odmowa dostępu,
- lint/typecheck/build.

Czego nie robić:

- nie budować nowych modułów biznesowych przed ochroną dostępu,
- nie używać user-editable metadata do autoryzacji.

## Faza 2: model danych 2.0

Cel: zaprojektować i wdrożyć pełny model domenowy.

Zakres:

- contacts,
- leads/deals,
- products,
- orders,
- payments,
- invoices,
- subscriptions,
- incidents,
- data subject requests,
- tasks,
- messages,
- CMS,
- newsletter,
- file objects,
- workflow runs,
- consent records.

Zależności:

- zakończona faza auth,
- decyzje produktowe z fazy 0,
- migracje Prisma/Supabase.

Pliki/moduły do zmiany:

- `prisma/schema.prisma`,
- `prisma/migrations/*`,
- `src/server/*`,
- seed/test fixtures.

Definicja ukończenia:

- schema pokrywa procesy MVP i target,
- migracje przechodzą,
- kluczowe indeksy są zdefiniowane,
- dane mają statusy i relacje,
- audit log ma jasne powiązania.

Ryzyka:

- zbyt ogólny model `Json`,
- brak indeksów pod CRM,
- brak izolacji organizacji,
- migracje bez rollback planu.

Testy:

- Prisma generate,
- migration test lokalny,
- testy service layer,
- audit query checks.

Czego nie robić:

- nie mieszać modeli testowych z produkcyjnymi,
- nie usuwać istniejących modeli bez migracji danych.

## Faza 3: design system i UX

Cel: ustabilizować wspólny język UI przed rozbudową ekranów.

Zakres:

- rozszerzenie komponentów UI,
- form patterns,
- empty/loading/error states,
- tabele CRM,
- wizardy,
- statusy,
- accessibility,
- responsywność.

Zależności:

- `docs/DESIGN_SYSTEM.md`,
- `docs/RESPONSIVE.md`,
- istniejące tokeny w `src/app/globals.css`.

Pliki/moduły do zmiany:

- `src/components/ui/*`,
- `src/app/globals.css`,
- komponenty landing/CRM/platformy.

Definicja ukończenia:

- wszystkie nowe ekrany korzystają z tokenów,
- brak raw brand colors poza tokenami,
- responsive check obejmuje krytyczne route'y,
- komponenty mają stany błędu i disabled.

Ryzyka:

- rozjazd między landing, CRM i platformą,
- zbyt szerokie refaktory UI,
- poziomy overflow.

Testy:

- lint,
- typecheck,
- build,
- responsive check,
- ręczny smoke na mobile/desktop.

Czego nie robić:

- nie importować prototypowych bundle'i design systemu,
- nie dokładać ad hoc palet.

## Faza 4: public site

Cel: doprowadzić publiczną stronę do gotowości sprzedażowej.

Zakres:

- landing,
- strony branżowe,
- strony produktów,
- checker IOD z lead submit,
- formularz kontaktowy,
- SEO metadata,
- podstawowa analityka.

Zależności:

- auth dla prywatnych API,
- model lead/contact/consent,
- DS/UX.

Pliki/moduły do zmiany:

- `src/app/page.tsx`,
- `src/components/landing/*`,
- `src/app/api/leads/*`,
- `src/server/leads/*`,
- `src/lib/iod-*`.

Definicja ukończenia:

- checker zapisuje lead i zgody,
- lead trafia do CRM,
- CTA prowadzą do realnych ścieżek,
- SEO i metadane są kompletne,
- content nie obiecuje funkcji niedostępnych produkcyjnie.

Ryzyka:

- wynik checkera bez zapisu,
- niejasne zgody,
- brak rate limit/spam protection.

Testy:

- unit dla mapperów checkera,
- integration dla `POST /api/leads/iod`,
- e2e checker -> lead,
- responsive check.

Czego nie robić:

- nie uruchamiać kampanii płatnych przed zamknięciem lead capture.

## Faza 5: sklep i checkout

Cel: umożliwić bezpieczny zakup dokumentów i pakietów.

Zakres:

- katalog produktów,
- koszyk,
- checkout,
- płatność,
- faktura/paragon,
- zamówienie w CRM,
- webhooki.

Zależności:

- model products/orders/payments/invoices,
- bramka płatności,
- integracja faktur,
- e-maile transakcyjne.

Pliki/moduły do zmiany:

- `src/app/sklep/*`,
- `src/app/checkout/*`,
- `src/server/payments/*`,
- `src/server/orders/*`,
- `src/server/invoices/*`,
- API webhooków.

Definicja ukończenia:

- zakup testowy przechodzi end-to-end,
- webhook jest idempotentny,
- zamówienie ma statusy,
- dokument nie jest wydany przed potwierdzeniem płatności,
- faktura jest powiązana z zamówieniem.

Ryzyka:

- brak idempotencji webhooków,
- błędne kwoty/VAT,
- brak obsługi anulowania i failed payment.

Testy:

- integration webhook,
- e2e checkout sandbox,
- test kwot i walut,
- test retry.

Czego nie robić:

- nie przyjmować realnych płatności bez stagingu i testowego reconciliation.

## Faza 6: generatory

Cel: stworzyć produkcyjny system generowania dokumentów.

Zakres:

- schema danych dla generatorów,
- formularze personalizacji,
- wersjonowane szablony,
- DOCX,
- PDF,
- HTML preview,
- review/approval,
- storage i signed URLs,
- retry i błędy.

Zależności:

- model danych 2.0,
- R2,
- Inngest,
- auth i role.

Pliki/moduły do zmiany:

- `src/server/documents/*`,
- `src/components/forms/*`,
- `src/app/documents/*`,
- `src/server/storage/*`,
- `src/server/inngest/*`,
- `prisma/schema.prisma`.

Definicja ukończenia:

- każdy generator ma testowy szablon,
- job ma statusy i audyt,
- pliki trafiają do R2,
- klient pobiera tylko własny dokument,
- operator widzi błąd i retry.

Ryzyka:

- szablony bez wersji,
- brak walidacji danych wejściowych,
- wyciek plików przez publiczne URL-e,
- brak PDF parity.

Testy:

- unit renderów,
- integration job -> generated document,
- storage signed URL,
- e2e formularz -> dokument.

Czego nie robić:

- nie generować dokumentów produkcyjnych bez review i audytu.

## Faza 7: CRM operacyjny

Cel: zamienić CRM z widoku mieszanego w realny system pracy.

Zakres:

- lead/deal pipeline,
- klienci,
- zamówienia,
- dokumenty,
- zadania,
- komunikacja,
- naruszenia,
- żądania osób,
- raporty,
- role i uprawnienia.

Zależności:

- auth,
- model danych 2.0,
- public lead capture,
- checkout/generatory.

Pliki/moduły do zmiany:

- `src/components/crm/*`,
- `src/server/crm/*`,
- `src/app/admin/*`,
- API CRM.

Definicja ukończenia:

- makietowe moduły są zastąpione danymi albo ukryte,
- każda akcja ma backend,
- tabele mają filtry, statusy i puste stany,
- szczegóły rekordów pokazują realne dane,
- audit log obejmuje mutacje.

Ryzyka:

- statyczne badge'e i mock data mylone z produkcją,
- brak paginacji,
- brak permissions per moduł.

Testy:

- integration dla list i mutacji,
- e2e dla lead -> deal -> order,
- responsive check CRM.

Czego nie robić:

- nie pokazywać modułów jako gotowych, jeśli nie mają tabel i backendu.

## Faza 8: platforma klienta

Cel: dać klientowi bezpieczny dostęp do dokumentów i spraw.

Zakres:

- dashboard klienta,
- dokumenty,
- zamówienia,
- naruszenia,
- żądania osób,
- wiadomości,
- użytkownicy organizacji,
- pobieranie plików,
- statusy i SLA.

Zależności:

- auth organizacyjny,
- storage,
- CRM,
- model danych dla spraw.

Pliki/moduły do zmiany:

- `src/app/client/*`,
- `src/components/client/*`,
- `src/server/client/*`,
- `src/server/storage/*`.

Definicja ukończenia:

- klient widzi tylko swoją organizację,
- pobiera tylko swoje pliki,
- może zgłosić naruszenie i żądanie,
- widzi status i historię,
- działania są audytowane.

Ryzyka:

- IDOR/BOLA,
- brak weryfikacji organizacji,
- zbyt dużo danych w jednym ekranie.

Testy:

- access control tests,
- e2e klient A/B,
- download signed URL,
- responsive.

Czego nie robić:

- nie wpuszczać klientów do portalu bez pełnej izolacji danych.

## Faza 9: blog/CMS i SEO

Cel: przenieść content z kodu do zarządzalnego CMS.

Zakres:

- posty,
- kategorie,
- autorzy,
- statusy,
- preview,
- SEO,
- sitemap,
- lead magnets,
- powiązanie z newsletterem.

Zależności:

- model CMS,
- role edytorów,
- public site.

Pliki/moduły do zmiany:

- `src/lib/blog.ts`,
- `src/app/blog/*`,
- `src/components/blog/*`,
- nowe modele CMS.

Definicja ukończenia:

- post można utworzyć, edytować, opublikować i wycofać,
- SEO metadata generują się z danych,
- blog ma preview i walidację slugów.

Ryzyka:

- utrata SEO przy migracji,
- brak redirectów,
- brak kontroli jakości treści prawnych.

Testy:

- render postów,
- sitemap,
- slug conflicts,
- preview access.

Czego nie robić:

- nie migrować contentu bez mapy URL i redirectów.

## Faza 10: automatyzacje

Cel: zautomatyzować powtarzalne procesy bez utraty kontroli operatora.

Zakres:

- przypisywanie leadów,
- alerty SLA,
- e-maile,
- retry dokumentów,
- follow-upy,
- raporty cykliczne,
- webhook processing.

Zależności:

- Inngest,
- modele workflow run,
- e-mail,
- CRM.

Pliki/moduły do zmiany:

- `src/server/inngest/*`,
- `src/server/automations/*`,
- `src/server/email/*`,
- modele workflow.

Definicja ukończenia:

- każda automatyzacja ma status, log i retry,
- błędy są widoczne w CRM,
- automatyzacje są idempotentne.

Ryzyka:

- duplikaty e-maili,
- powtórne księgowanie płatności,
- ukryte błędy workflow.

Testy:

- unit workflow logic,
- integration Inngest,
- idempotency tests,
- failure/retry tests.

Czego nie robić:

- nie automatyzować decyzji prawnych bez review człowieka.

## Faza 11: testy i QA

Cel: osiągnąć przewidywalną jakość przed stagingiem.

Zakres:

- unit,
- integration,
- e2e,
- responsive,
- accessibility,
- security smoke,
- load smoke,
- webhook sandbox.

Zależności:

- stabilne moduły,
- dane testowe,
- środowisko staging.

Pliki/moduły do zmiany:

- konfiguracja testów,
- test fixtures,
- CI workflow,
- dokumentacja QA.

Definicja ukończenia:

- krytyczne ścieżki mają testy,
- CI blokuje regresje,
- raport QA jest powtarzalny.

Ryzyka:

- testy flaky,
- brak seedów,
- testy bez izolacji danych.

Testy:

- pełen zestaw QA.

Czego nie robić:

- nie uznawać zielonego builda za pełne QA.

## Faza 12: staging i production readiness

Cel: przygotować kontrolowane uruchomienie produkcyjne.

Zakres:

- staging,
- env separation,
- migracje,
- backupy,
- monitoring,
- alerty,
- runbook,
- release checklist,
- smoke tests,
- incident response.

Zależności:

- zakończone kluczowe moduły,
- testy i QA,
- integracje w sandboxie.

Pliki/moduły do zmiany:

- `.github/workflows/*`,
- docs release/runbook,
- konfiguracja Vercel,
- konfiguracja monitoring/analityka.

Definicja ukończenia:

- staging odtwarza produkcyjne integracje na danych testowych,
- release checklist jest kompletna,
- rollback jest opisany,
- monitoring ma alerty,
- pierwsza produkcja ma plan smoke testów.

Ryzyka:

- różnice staging/prod,
- brak backupów,
- brak ownerów alertów,
- sekrety w złych środowiskach.

Testy:

- staging smoke,
- webhook sandbox,
- backup restore test,
- post-deploy smoke.

Czego nie robić:

- nie wdrażać produkcji bez przejścia checklisty readiness.
