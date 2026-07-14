# PRIVAZY - specyfikacja produktu docelowego

Status dokumentu: faza 0, dokumentacja i audyt.
Źródło wniosków: obecne pliki repozytorium `privazyy/privazy` na branchu `main`.

## 1. Czym jest PRIVAZY

PRIVAZY ma być pełną platformą legaltech RODO/GDPR dla polskich firm. Produkt łączy publiczną stronę sprzedażową, checker obowiązku IOD, sklep z dokumentami, generatory DOCX/PDF/HTML, CRM wewnętrzny oraz portal klienta do obsługi dokumentów, naruszeń, żądań osób i stałego outsourcingu IOD.

Docelowo PRIVAZY nie jest tylko landing page ani katalogiem dokumentów. To operacyjny system, który:

- pozyskuje leady z treści, SEO i checkerów,
- kwalifikuje ryzyko i obowiązek IOD,
- sprzedaje pakiety dokumentów oraz usługi,
- generuje dokumenty z wersjonowanych szablonów,
- prowadzi sprawy klientów w CRM,
- udostępnia klientom portal do dokumentów, incydentów i komunikacji,
- automatyzuje e-maile, zadania, statusy i raporty,
- utrzymuje audyt działań oraz gotowość do kontroli.

## 2. Segmenty klientów

### Mikro i małe firmy

Firmy, które potrzebują uporządkować podstawową dokumentację RODO, politykę prywatności, upoważnienia, rejestry i procedury naruszeń. Najważniejsze potrzeby: szybki zakup, prosty formularz, cena pakietowa, jasne instrukcje.

### Firmy z danymi podwyższonego ryzyka

Podmioty medyczne, edukacyjne, HR, e-commerce, kancelarie, firmy odszkodowawcze i SaaS. Najważniejsze potrzeby: ocena obowiązku IOD, DPIA, procedury, stała opieka, historia decyzji.

### Organizacje z obowiązkiem lub wysokim prawdopodobieństwem IOD

Organizacje publiczne, podmioty przetwarzające dane szczególnych kategorii na dużą skalę, podmioty prowadzące regularny i systematyczny monitoring. Najważniejsze potrzeby: formalne powołanie IOD, obsługa incydentów, raporty, kontakt z organem nadzorczym.

### Klienci abonamentowi

Firmy korzystające z outsourcingu IOD i platformy klienta. Najważniejsze potrzeby: portal, SLA, zgłaszanie naruszeń, żądania osób, stały kontakt z inspektorem, dokumentacja audytowa.

### Zespół wewnętrzny PRIVAZY

Sales, prawnicy/IOD, document specialists, operatorzy, księgowość i administracja. Najważniejsze potrzeby: CRM, pipeline, kolejki zadań, szablony, joby generowania, statusy spraw, alerty i raporty.

## 3. Główne ścieżki użytkownika

### Ścieżka "nie wiem, czy muszę mieć IOD"

1. Użytkownik trafia na landing lub artykuł blogowy.
2. Uruchamia checker obowiązku IOD.
3. Odpowiada na pytania o branżę, rolę, reżim prawny, skalę i kategorie danych.
4. Otrzymuje wynik informacyjny i rekomendację.
5. Podaje dane kontaktowe i zgody.
6. System tworzy lead, organizację i zgłoszenie w CRM.
7. Sales/IOD kwalifikuje sprawę i proponuje konsultację, pakiet lub outsourcing.

Obecny stan: logika oceny IOD istnieje w `src/lib/iod-checker.ts` i `src/lib/iod-obligation-checker.ts`; API zapisu leadu istnieje w `src/app/api/leads/iod/route.ts`, ale landing jeszcze go nie wywołuje.

### Ścieżka "chcę kupić dokumenty"

1. Użytkownik wybiera pakiet lub pojedynczy dokument.
2. Widzi zakres, cenę, czas realizacji i warunki.
3. Przechodzi checkout.
4. Opłaca zamówienie.
5. Wypełnia formularz personalizacji.
6. System tworzy job generowania dokumentu.
7. Operator lub automatyzacja sprawdza wynik.
8. Klient otrzymuje link do dokumentu i historię w portalu.

Obecny stan: istnieje strona produktu `/sklep/polityka-prywatnosci`, przykładowy formularz generowania `/documents`, modele `DocumentTemplate`, `DocumentGenerationJob`, `GeneratedDocument`, R2 helpery i Inngest worker. Brakuje checkoutu, płatności, koszyka, UX klienta i ochrony dostępu.

### Ścieżka "stały outsourcing IOD"

1. Użytkownik wybiera outsourcing z landing page lub po wyniku checkera.
2. Umawia rozmowę i przechodzi kwalifikację.
3. Zespół tworzy klienta, umowę, abonament i opiekuna IOD.
4. Klient dostaje portal, dokumenty, zgłaszanie incydentów i kanał komunikacji.
5. CRM obsługuje SLA, zadania, naruszenia, żądania osób i raporty.

Obecny stan: landing prezentuje outsourcing i platformę, ale brak modeli abonamentów, spraw IOD, SLA i portalu klienta.

### Ścieżka "obsługa naruszenia"

1. Pracownik klienta lub operator zgłasza incydent.
2. System tworzy sprawę naruszenia z terminem 72h.
3. IOD ocenia ryzyko i decyzję o zgłoszeniu do UODO/osób.
4. System prowadzi zadania, dowody, komunikację i dokumentację.
5. CRM raportuje status i ryzyka.

Obecny stan: CRM pokazuje moduł naruszeń jako brak tabeli; landing ma prezentacyjne UI platformy incydentowej.

### Ścieżka "żądanie osoby"

1. Osoba składa żądanie dostępu, sprostowania, usunięcia, sprzeciwu lub przeniesienia.
2. System weryfikuje tożsamość i termin.
3. Operator/IOD przygotowuje odpowiedź.
4. Klient widzi status i historię w portalu.

Obecny stan: CRM filtruje żądania z `FormSubmission`, ale brakuje dedykowanego modelu, terminów, weryfikacji tożsamości i portalu.

## 4. Docelowe produkty i usługi

- Checker obowiązku IOD.
- Konsultacja RODO/IOD.
- Pojedyncze dokumenty RODO.
- Pakiety dokumentów: Mikro, Standard, Pro oraz branżowe.
- Generator polityki prywatności.
- Generator rejestru czynności przetwarzania.
- Generator procedury naruszeń.
- Generator upoważnień i ewidencji.
- Generator DPIA.
- Generator umów powierzenia.
- Outsourcing IOD.
- Platforma klienta.
- Obsługa naruszeń.
- Obsługa żądań osób.
- Szkolenia i materiały.
- Audyty zgodności.
- Raporty okresowe.

## 5. Model sprzedaży

### Kanały

- SEO i blog.
- Landing produktowy.
- Checker IOD.
- Kampanie paid search/social.
- Remarketing.
- Polecenia.
- Cross-sell z pakietów do outsourcingu.
- Upsell z pojedynczych dokumentów do pakietu.

### Jednostki sprzedaży

- Produkt jednorazowy: pojedynczy dokument.
- Pakiet jednorazowy: zestaw dokumentów.
- Usługa konsultacyjna.
- Abonament outsourcingu IOD.
- Abonament platformy klienta.
- Dodatkowy audyt lub wdrożenie.

### CRM

Każda ścieżka sprzedaży powinna tworzyć lub aktualizować:

- organizację,
- kontakt,
- lead/deal,
- źródło kampanii,
- wynik checkera,
- status kwalifikacji,
- opiekuna,
- kolejne zadanie,
- historię komunikacji.

## 6. Moduły publiczne

- Landing główny.
- Checker IOD.
- Strony branżowe.
- Strony produktów i pakietów.
- Sklep/katalog.
- Checkout.
- Blog i baza wiedzy.
- FAQ.
- Formularze kontaktowe.
- Polityka prywatności, regulaminy i dokumenty prawne.

## 7. Moduły CRM

Docelowy CRM powinien obsługiwać:

- dashboard operacyjny,
- ruch i marketing,
- leady,
- sprzedaż,
- klienci,
- organizacje,
- zamówienia,
- dokumenty,
- pakiety i produkty,
- outsourcing IOD,
- naruszenia,
- żądania osób,
- skrzynkę/komunikację,
- zadania,
- kalendarz,
- raporty,
- księgowość,
- blog/CMS,
- newsletter,
- pracowników,
- platformę klienta,
- automatyzacje,
- ustawienia,
- administrację i audyt.

Obecny `src/server/crm/data.ts` zasila część modułów z Prismy, ale wiele obszarów ma świadomie puste moduły, bo w schemacie nie ma jeszcze tabel.

## 8. Moduły platformy klienta

Docelowa platforma klienta powinna zawierać:

- logowanie klienta,
- dashboard klienta,
- dokumenty i wersje,
- status zamówień,
- formularze danych do dokumentów,
- zgłaszanie naruszeń,
- obsługę żądań osób,
- kanał kontaktu z IOD,
- historię działań,
- raporty okresowe,
- zadania i terminy,
- użytkowników organizacji,
- uprawnienia i role,
- bezpieczne pobieranie plików.

Obecny `/client` jest placeholderem.

## 9. Docelowa lista generatorów dokumentów

Priorytet P0:

- Polityka ochrony danych osobowych.
- Polityka prywatności sklepu/serwisu.
- Rejestr czynności przetwarzania.
- Umowa powierzenia.
- Procedura naruszeń.
- Procedura obsługi żądań osób.
- Upoważnienie do przetwarzania danych.
- Ewidencja upoważnień.

Priorytet P1:

- DPIA.
- Analiza ryzyka.
- Polityka cookies.
- Instrukcja bezpieczeństwa IT.
- Clean desk policy.
- Klauzule informacyjne dla klientów, pracowników i kandydatów.
- Rejestr kategorii czynności dla processorów.

Priorytet P2:

- Raport miesięczny IOD.
- Notatka z oceny obowiązku IOD.
- Zgłoszenie naruszenia do UODO.
- Zawiadomienie osoby, której dane dotyczą.
- Plan działań naprawczych.
- Materiały szkoleniowe.

Każdy generator musi mieć wersjonowany szablon, schemat danych, walidację, podgląd, DOCX, PDF, status, historię, audyt i możliwość ręcznej akceptacji.

## 10. Definicja pełnej gotowości produktu

Produkt jest gotowy dopiero, gdy:

- public site, sklep, checkout, blog i formularze działają end-to-end,
- checker zapisuje leady i poprawnie trafia do CRM,
- auth i role chronią wszystkie prywatne route'y i API,
- modele Prisma pokrywają kluczowe procesy,
- generator dokumentów ma działające szablony, storage, joby i review,
- CRM obsługuje realne rekordy, nie makiety,
- platforma klienta obsługuje dokumenty, naruszenia, żądania i komunikację,
- płatności i faktury są zintegrowane,
- e-maile transakcyjne mają szablony, logi i retry,
- automatyzacje mają observability i kontrolę błędów,
- monitoring, backupy, audyt i procedury incident response są gotowe,
- testy obejmują unit, integration, e2e, responsive, security i happy-path płatności,
- staging jest oddzielony od produkcji,
- dane testowe nie mieszają się z produkcyjnymi.

## 11. Czego świadomie nie wypuszczamy jako częściowej produkcji

- Publicznego panelu CRM bez auth i ról.
- Checkera, który pokazuje wynik, ale nie zapisuje leadu i zgód.
- Checkoutu bez poprawnej płatności, webhooków i faktury/paragonu.
- Generatora, który tworzy dokument bez audytu, wersji i śladu danych wejściowych.
- Portalu klienta bez kontroli dostępu do organizacji i plików.
- Modułu naruszeń bez terminów, historii decyzji i dokumentacji.
- E-maili transakcyjnych bez logowania wysyłek i retry.
- Integracji storage bez prywatnych plików, podpisanych URL-i i kontroli uprawnień.
- Raportowania, które opiera się na statycznych makietach.
- Produkcji bez stagingu, monitoringu i checklisty release.
