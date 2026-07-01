# PRIVAZY UX foundation

Status: Phase 3 UI/UX foundation.

Ten dokument opisuje sposob budowy ekranow PRIVAZY przed wdrozeniem pelnych funkcji sklepu, checkoutu, CRM CRUD i platformy klienta. Obowiazuja tez `docs/DESIGN_SYSTEM.md` i `docs/RESPONSIVE.md`.

## Glowne zasady UX

- Interfejs ma byc spokojny, zaufany, bialy i jasnoniebieski.
- Copy jest po polsku, konkretne i operacyjne.
- Najpierw pokazujemy decyzje, status i nastepny krok, potem szczegoly prawne.
- Kazdy ekran musi miec jasny tytul, kontekst i jedna dominujaca akcje.
- Komponenty uzywaja tokenow z `src/app/globals.css`; nie dodajemy surowych kolorow ani fioletowych gradientow.
- Szerokie widoki maja kontrolowany scroll, a nie overflow calej strony.

## Formularze

- Formularz dzielimy na sekcje przez `FormSection`.
- Pola logicznie grupujemy przez `FieldGroup`; na mobile grupa uklada sie w jedna kolumne.
- Pole ma label, hint albo blad, a wymagane zgody maja jasny tekst i zakres.
- Walidacja powinna wskazywac problem przy polu oraz w `FormSummary`, gdy formularz jest wieloetapowy.
- Akcje formularza sa w `FormActions`: druga akcja po lewej/wyzej na mobile, glowna po prawej/na dole.
- Dla wieloetapowych procesow uzywamy `MultiStepFormShell` i `Stepper`.

## Checkout

- Checkout jest procesem, nie landing page. Uzywa `CheckoutLayout`, `CheckoutStepIndicator` i `CartSummary`.
- Cena zawsze rozdziela brutto, opcjonalnie netto i VAT przez `PriceBlock`.
- Platnosc i realizacja maja osobne statusy przez `PaymentStatusCard` i `OrderStatusCard`.
- Nie ukrywamy kosztow dodatkowych; puste lub oczekujace dane pokazuja `LoadingState` albo `Alert`.

## CRM

- CRM jest gesty, skanowalny i operacyjny.
- Widok listy sklada sie z `CrmPageHeader`, `CrmToolbar`, `CrmKpiGrid` i `DataTable`.
- Widok szczegolu uzywa `CrmDetailLayout`; prawa kolumna sluzy do statusu, opiekuna, notatek i aktywnosci.
- Statusy CRM sa krotkie i konsekwentne, najlepiej przez `StatusBadge`.
- Akcje w tabeli sa male i powtarzalne przez `CrmTableActions`.

## Platforma klienta

- Portal klienta ma byc spokojniejszy niz CRM i prowadzic po zadaniach.
- Uzywamy `ClientPortalShell`, `ClientDashboardCard`, `ClientDocumentCard`, `ClientTaskCard`, `ClientMessageThread` i `ClientStatusTimeline`.
- Klient widzi status, termin i nastepny krok. Detale prawne sa rozwijane dopiero po otwarciu sprawy.
- Komunikacja ma byc audytowalna, ale nie moze wygladac jak wewnetrzne narzedzie operacyjne.

## Komunikaty prawne i disclaimery

- Disclaimer dodajemy przy checkerach, generatorach, wynikach automatycznych i tresciach prawnych.
- Standardowy komponent: `LegalDisclaimer`.
- Tekst ma mowic, ze material ma charakter ogolny i nie stanowi porady prawnej dla konkretnej sprawy.
- Disclaimer nie powinien blokowac glownej akcji, ale musi byc widoczny przed finalnym wyslaniem danych.

## Puste stany

- Pusty stan ma nazwac brak danych i pokazac sensowny nastepny krok.
- Uzywamy `EmptyState`, opcjonalnie z akcja.
- Nie pokazujemy pustych tabel bez wyjasnienia.

## Bledy

- Blad ma powiedziec co sie stalo i co uzytkownik moze zrobic.
- Uzywamy `ErrorState` dla widokow oraz `Alert tone="danger"` dla lokalnych bledow.
- Nie pokazujemy surowych stack trace ani danych technicznych klientowi.

## Loading

- Dla list i kart uzywamy `LoadingState`.
- Loading powinien zajmowac podobna przestrzen jak docelowy komponent, zeby ograniczyc skok layoutu.
- Dlugie procesy powinny pokazywac status, a nie spinner bez kontekstu.

## Statusy

- Statusy sa krotkie, rzeczownikowe albo imieslowowe: `Nowy`, `W toku`, `Gotowe`, `Blad`.
- Kolory statusow ida przez `StatusBadge` i tokeny: brand/info, success, warning, danger, neutral.
- Status nie moze byc jedynym nosnikiem informacji; tekst jest zawsze wymagany.

## Tabele i szczegoly

- Szerokie tabele uzywaja `DataTable`, `pvz-h-scroll` i `data-responsive-scroll="true"`.
- Komorki tabel musza miec `min-w-0` oraz zawijanie dlugich wartosci.
- Widoki szczegolu powinny miec glowna kolumne tresci i boczna kolumne statusu/notatek.
- Akcje masowe w tabelach sa w toolbarze, a akcje rekordu w `CrmTableActions`.

## Mobile-first

- Projektujemy od 360 px szerokosci.
- Formularze i karty ukladaja sie w jedna kolumne na mobile.
- Teksty dlugie maja `break-words`, `min-w-0` albo `truncate`.
- CTA nie moze wychodzic poza kontener; przyciski ukladaja sie pionowo, gdy brakuje miejsca.
- Kazdy szeroki komponent ma kontrolowany scroll, a nie overflow na `body`.
