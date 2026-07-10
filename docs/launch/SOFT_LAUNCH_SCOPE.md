# Soft Launch Scope

## Decyzja zakresowa

Ten dokument opisuje kontrolowany soft launch PRIVAZY. To jest ograniczone uruchomienie operacyjne dla malej liczby realnych uzytkownikow, klientow testowych albo wewnetrznych operatorow. To nie jest publiczne odpalenie produktu, masowa kampania marketingowa ani potwierdzenie gotowosci produkcyjnej.

Najnowsza znana decyzja z poprzedniego audit PR `[ops] perform staging verification and release candidate audit` to `STAGING_NO_GO`. Poniewaz ten branch jest oparty o `main` i artefakty audytu RC nie sa tu jeszcze zmergowane, obowiazuje konserwatywna decyzja: soft launch pozostaje `NO_GO` do czasu domkniecia warunkow.

## Kto moze korzystac

| Grupa | Dopuszczona? | Warunek |
| --- | --- | --- |
| Wlasciciel/operator PRIVAZY | Tak | Tylko testy kontrolne i wsparcie pierwszych uzytkownikow |
| Male grono testowych organizacji | Nie teraz | Dopiero po zmianie decyzji na `STAGING_CONDITIONAL_GO` albo `STAGING_GO` |
| Publiczni anonimowi uzytkownicy | Ograniczenie | Tylko public landing i formularze, bez obietnicy obslugi platnej |
| Ruch marketingowy/high traffic | Nie | Oddzielna decyzja launchowa i monitoring |

Limit po spelnieniu warunkow conditional launch: maksymalnie 5 organizacji i maksymalnie 15 kont uzytkownikow. Kazda organizacja musi miec przypisanego opiekuna supportu.

## Wlaczone tylko jako zakres docelowy

| Modul | Status launchowy | Uwagi |
| --- | --- | --- |
| Public landing | Allowed after smoke | Bez kampanii wysokiego ruchu |
| IOD checker | Allowed after smoke | Formularz publiczny wymaga abuse protection przed szerszym ruchem |
| Lead capture | Allowed after smoke | Manualny triage w CRM |
| CRM lead handling | Internal only | Dostep tylko staff, READ_ONLY bez mutacji |
| Portal klienta | Conditional | Wymaga potwierdzenia auth, tenant isolation i secure download |
| DocumentInput | Conditional | Tylko po potwierdzeniu izolacji organizacji |
| Generator Polityki prywatnosci | Conditional | Tylko jeden kontrolowany typ dokumentu |
| Secure download | Conditional | Bez publicznych fileKey i z testem uprawnien |
| Breach register | Conditional | Jezeli modul jest zmergowany i przetestowany |
| DSR register | Conditional | Jezeli modul jest zmergowany i przetestowany |
| Notifications | Conditional | Tylko transakcyjne, bez kampanii |

## Wylaczone albo ograniczone

| Obszar | Ustawienie |
| --- | --- |
| Live payments | Disabled bez oddzielnego approval |
| Live invoices | Disabled bez oddzielnego approval |
| Newsletter campaigns | Disabled |
| Zaawansowane automatyzacje | Disabled lub manual review |
| Masowy marketing | Disabled |
| Public high traffic | Disabled |
| Produkcyjny paid launch | Disabled do legal/payment/invoice approval |

## Ryzyka zaakceptowane dla przygotowania

- Dokumentacja launchowa moze byc gotowa przed pelna techniczna gotowoscia.
- Czesc checklist wymaga recznego potwierdzenia na stagingu.
- Support pierwszych uzytkownikow moze byc manualny.
- Monitoring moze byc `MANUAL_REQUIRED`, o ile launch pozostaje zablokowany.

## Ryzyka nieakceptowane

- Publiczny paid launch bez zaakceptowanych dokumentow prawnych.
- Live payments albo live invoices bez oddzielnej decyzji.
- Dostep CLIENT do CRM.
- Mutacje READ_ONLY.
- Cross-tenant leak.
- Publiczny dostep do wygenerowanych dokumentow lub surowych `fileKey`.
- Brak rollback planu, maintenance mode planu albo incident response.
