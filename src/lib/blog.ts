export const blogCategories = {
  rodo: {
    label: "RODO",
    tag: "RODO i ochrona danych",
    tone: "brand",
  },
  iod: {
    label: "Obowiązek IOD",
    tag: "Inspektor Ochrony Danych",
    tone: "warning",
  },
  poradniki: {
    label: "Poradniki",
    tag: "Poradniki dla firm",
    tone: "success",
  },
  prawo: {
    label: "Zmiany w prawie",
    tag: "Zmiany w prawie",
    tone: "brand-dark",
  },
} as const;

export type BlogCategoryKey = keyof typeof blogCategories;

export type BlogTocItem = {
  id: string;
  label: string;
};

export type BlogFeature = {
  icon: "landmark" | "radar" | "heart-pulse" | "search-check" | "graduation-cap" | "phone" | "clipboard-check";
  label?: string;
  ref?: string;
  text: string;
  title: string;
};

export type BlogArticleSection = {
  body: string[];
  features?: BlogFeature[];
  id: string;
  stats?: Array<{
    label: string;
    value: string;
  }>;
  title: string;
};

export type BlogSource = {
  label: string;
  href: string;
};

export type BlogArticle = {
  author: string;
  authorInitials: string;
  category: BlogCategoryKey;
  coverNote: string;
  date: string;
  excerpt: string;
  featured?: boolean;
  heroLabel: string;
  quote?: string;
  readTime: string;
  sections: BlogArticleSection[];
  slug: string;
  sources?: BlogSource[];
  summary: string[];
  title: string;
  updated: string;
};

const gdprSource = {
  label: "Tekst RODO w EUR-Lex",
  href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/pol",
};

const uodoDpoSource = {
  label: "UODO: Inspektor Ochrony Danych",
  href: "https://uodo.gov.pl/pl/672/4186",
};

export const blogArticles: BlogArticle[] = [
  {
    slug: "transfery-danych-do-usa-w-2026-checklista",
    title: "Transfery danych do USA w 2026: co sprawdzić przed wdrożeniem SaaS",
    excerpt:
      "Praktyczna checklista dla firm korzystających z amerykańskich dostawców chmury, CRM, analityki i narzędzi marketingowych.",
    category: "prawo",
    author: "Paweł Nowak",
    authorInitials: "PN",
    date: "21 cze 2026",
    updated: "czerwiec 2026",
    readTime: "10 min",
    heroLabel: "Transfery danych",
    coverNote: "art. 44-49 RODO",
    featured: true,
    summary: [
      "Transfer poza EOG wymaga podstawy z rozdziału V RODO, a nie tylko zapisu w regulaminie dostawcy.",
      "Przed wdrożeniem SaaS trzeba sprawdzić role stron, lokalizację danych, podprocesorów i mechanizmy transferu.",
      "Warto utrzymywać prosty rejestr dostawców, bo zmiany w stacku IT szybko tworzą nowe transfery danych.",
    ],
    sections: [
      {
        id: "mapa-transferu",
        title: "Zacznij od mapy przepływu danych",
        body: [
          "Transfer danych nie zawsze wygląda jak klasyczna wysyłka pliku za granicę. W praktyce może powstać przy hostingu, helpdesku, analityce, CRM, wysyłce newslettera albo narzędziach do obsługi klienta.",
          "Najpierw wypisz dostawców, role stron, kategorie danych i kraje, w których dane mogą być przetwarzane. Dopiero na tej podstawie oceniaj, czy potrzebne są dodatkowe zabezpieczenia.",
        ],
      },
      {
        id: "podstawa-prawna",
        title: "Sprawdź mechanizm z rozdziału V RODO",
        body: [
          "Jeśli dostawca lub jego podprocesorzy działają poza EOG, sprawdź, na jakiej podstawie odbywa się transfer. Najczęściej będą to standardowe klauzule umowne, decyzja stwierdzająca odpowiedni stopień ochrony albo szczególny wyjątek.",
          "Nie zakładaj, że sam fakt korzystania z dużej platformy rozwiązuje temat. Administrator nadal powinien umieć wykazać, dlaczego transfer jest zgodny z RODO.",
        ],
      },
      {
        id: "dokumentacja",
        title: "Zostaw ślad decyzyjny",
        body: [
          "W dokumentacji warto trzymać datę weryfikacji dostawcy, link do DPA, informację o podprocesorach, podstawę transferu i krótką ocenę ryzyka.",
          "Taki ślad jest szczególnie ważny, gdy w firmie narzędzia SaaS wdrażają różne działy: sprzedaż, marketing, HR i IT.",
        ],
      },
    ],
    sources: [gdprSource],
  },
  {
    slug: "rejestr-czynnosci-przetwarzania-bez-bledow",
    title: "Rejestr czynności przetwarzania: jak prowadzić go bez błędów",
    excerpt:
      "Praktyczny przewodnik po RCP: jakie kolumny są obowiązkowe, jak opisać kategorie danych i kiedy aktualizować wpisy.",
    category: "rodo",
    author: "Maria Kowalska",
    authorInitials: "MK",
    date: "18 cze 2026",
    updated: "czerwiec 2026",
    readTime: "7 min",
    heroLabel: "Rejestr czynności",
    coverNote: "art. 30 RODO",
    summary: [
      "Rejestr powinien opisywać realne procesy, a nie nazwy dokumentów lub systemów.",
      "Najczęstszy błąd to brak odbiorców, okresów retencji i podstaw przetwarzania.",
      "Aktualizacja rejestru powinna być częścią zmian w procesach, a nie dorocznym rytuałem.",
    ],
    sections: [
      {
        id: "procesy",
        title: "Opisuj proces, nie sam system",
        body: [
          "Dobry wpis w rejestrze odpowiada na pytanie: po co firma przetwarza dane i w jakim procesie biznesowym. Samo hasło CRM, sklep internetowy albo kadry zwykle nie wystarcza.",
          "W praktyce jeden system może obsługiwać kilka czynności przetwarzania, a jedna czynność może obejmować kilka narzędzi.",
        ],
      },
      {
        id: "obowiazkowe-pola",
        title: "Pola, których najczęściej brakuje",
        body: [
          "Najczęściej pomijane elementy to odbiorcy danych, planowane terminy usunięcia, transfery poza EOG i zabezpieczenia techniczne.",
          "Jeśli tych danych brakuje, rejestr nie pomaga w kontroli zgodności i szybko staje się martwym dokumentem.",
        ],
      },
      {
        id: "utrzymanie",
        title: "Jak utrzymać rejestr aktualny",
        body: [
          "Najlepiej połączyć aktualizację rejestru ze zmianami w firmie: nowym formularzem, dostawcą, procesem marketingowym lub systemem HR.",
          "Właściciel procesu powinien potwierdzić wpis, a osoba odpowiedzialna za RODO powinna zadbać o spójność całego rejestru.",
        ],
      },
    ],
    sources: [gdprSource],
  },
  {
    slug: "czy-musisz-powolac-inspektora-ochrony-danych",
    title: "Czy musisz powołać Inspektora Ochrony Danych? 5 sygnałów",
    excerpt:
      "Nie każda firma ma obowiązek wyznaczyć IOD. Sprawdź przesłanki z art. 37 RODO i sytuacje, które wymagają indywidualnej oceny.",
    category: "iod",
    author: "Tomasz Lis",
    authorInitials: "TL",
    date: "15 cze 2026",
    updated: "czerwiec 2026",
    readTime: "6 min",
    heroLabel: "Poradnik RODO",
    coverNote: "art. 37 RODO",
    summary: [
      "IOD jest obowiązkowy w trzech przypadkach z art. 37 RODO.",
      "Decyduje charakter i skala przetwarzania, a nie sama liczba pracowników.",
      "Dobrowolnie powołany IOD podlega tym samym zasadom co IOD obowiązkowy.",
    ],
    quote: "Obowiązek nie wynika z liczby pracowników, lecz z tego, czym jest główna działalność organizacji.",
    sections: [
      {
        id: "kim-jest-iod",
        title: "Kim jest Inspektor Ochrony Danych?",
        body: [
          "IOD to osoba, która monitoruje zgodność przetwarzania z RODO i jest punktem kontaktu dla organu nadzorczego oraz osób, których dane dotyczą.",
          "Inspektorem może być pracownik albo zewnętrzny ekspert działający na podstawie umowy. W mniejszych firmach coraz częściej jest to usługa w outsourcingu.",
        ],
      },
      {
        id: "kiedy-obowiazkowy",
        title: "Trzy sytuacje, w których IOD jest obowiązkowy",
        body: [
          "Wystarczy spełnienie jednej przesłanki z art. 37 RODO. Wtedy powołanie IOD nie jest dobrą praktyką, tylko obowiązkiem administratora lub podmiotu przetwarzającego.",
        ],
        features: [
          {
            icon: "landmark",
            title: "Organ lub podmiot publiczny",
            text: "Jednostki sektora publicznego mają obowiązek powołać IOD, z wyjątkiem sądów w zakresie sprawowania wymiaru sprawiedliwości.",
            ref: "art. 37 ust. 1 lit. a",
          },
          {
            icon: "radar",
            title: "Regularne monitorowanie na dużą skalę",
            text: "Dotyczy organizacji, których główna działalność polega na systematycznym monitorowaniu osób na dużą skalę.",
            ref: "art. 37 ust. 1 lit. b",
          },
          {
            icon: "heart-pulse",
            title: "Dane szczególnej kategorii na dużą skalę",
            text: "Chodzi m.in. o dane zdrowotne, biometryczne, dotyczące przekonań lub dane o wyrokach i naruszeniach prawa.",
            ref: "art. 37 ust. 1 lit. c",
          },
        ],
      },
      {
        id: "kara",
        title: "Co grozi za brak IOD?",
        body: [
          "Brak wymaganego IOD może być potraktowany jako naruszenie obowiązków administratora. W praktyce liczy się także to, czy firma potrafi wykazać, że przeprowadziła ocenę obowiązku.",
        ],
        stats: [
          { value: "10 mln EUR", label: "maksymalna kara kwotowa" },
          { value: "2%", label: "rocznego światowego obrotu" },
        ],
      },
      {
        id: "dobrowolny-iod",
        title: "Nie masz obowiązku? Rozważ dobrowolne powołanie",
        body: [
          "Dobrowolne powołanie IOD może uporządkować procesy i zwiększyć zaufanie klientów. Trzeba jednak pamiętać, że dobrowolnie powołany Inspektor podlega zasadom z art. 37-39 RODO.",
        ],
        features: [
          { icon: "search-check", title: "Monitorowanie zgodności", text: "Stały przegląd procesów, dokumentacji i ryzyk." },
          { icon: "graduation-cap", title: "Szkolenia", text: "Podnoszenie świadomości pracowników i właścicieli procesów." },
          { icon: "phone", title: "Kontakt z UODO", text: "Punkt kontaktu dla organu i osób, których dane dotyczą." },
          { icon: "clipboard-check", title: "DPIA", text: "Wsparcie przy ocenie skutków dla ochrony danych." },
        ],
      },
    ],
    sources: [gdprSource, uodoDpoSource],
  },
  {
    slug: "rodo-w-malej-firmie-minimum-do-wdrozenia",
    title: "RODO w małej firmie: minimum, które musisz wdrożyć",
    excerpt:
      "Od polityki prywatności po upoważnienia. Lista dokumentów i decyzji, bez których mikroprzedsiębiorca działa z niepotrzebnym ryzykiem.",
    category: "poradniki",
    author: "Anna Wójcik",
    authorInitials: "AW",
    date: "12 cze 2026",
    updated: "czerwiec 2026",
    readTime: "6 min",
    heroLabel: "Poradnik dla firm",
    coverNote: "minimum RODO",
    summary: [
      "Mała firma także powinna znać cele, podstawy i okresy przetwarzania danych.",
      "Najważniejsze dokumenty to klauzule informacyjne, rejestr czynności, upoważnienia i umowy powierzenia.",
      "RODO najlepiej wdrażać wokół realnych procesów: sprzedaży, HR, strony www i księgowości.",
    ],
    sections: [
      {
        id: "procesy",
        title: "Zacznij od czterech procesów",
        body: [
          "W większości małych firm podstawowe procesy to obsługa klientów, księgowość, marketing i zatrudnienie lub współpraca B2B.",
          "Dla każdego procesu określ cel, podstawę prawną, kategorie danych, odbiorców i czas przechowywania.",
        ],
      },
      {
        id: "dokumenty",
        title: "Dokumenty, które zwykle są potrzebne",
        body: [
          "Najczęściej potrzebujesz polityki prywatności na stronę, klauzul informacyjnych, rejestru czynności, upoważnień i umów powierzenia z dostawcami.",
          "Nie chodzi o segregator dokumentów, tylko o zestaw decyzji, które da się zastosować w codziennej pracy.",
        ],
      },
      {
        id: "utrzymanie",
        title: "Jak nie wrócić do chaosu",
        body: [
          "Ustal prostą zasadę: nowy formularz, nowy dostawca albo nowa kampania marketingowa oznacza krótką kontrolę RODO.",
          "Taki przegląd trwa kilkanaście minut, ale zapobiega narastaniu zaległości.",
        ],
      },
    ],
    sources: [gdprSource],
  },
  {
    slug: "kary-uodo-w-2025-wnioski-dla-firm",
    title: "Kary UODO w 2025 roku: czego nauczyły nas decyzje",
    excerpt:
      "Jak czytać decyzje organu i przekładać je na działania w firmie: retencję, bezpieczeństwo, dokumentację i reakcję na naruszenia.",
    category: "prawo",
    author: "Paweł Nowak",
    authorInitials: "PN",
    date: "9 cze 2026",
    updated: "czerwiec 2026",
    readTime: "8 min",
    heroLabel: "Decyzje organu",
    coverNote: "praktyka UODO",
    summary: [
      "Decyzje organu warto traktować jak listę kontrolną, nie tylko news prawny.",
      "Najczęściej powtarzają się błędy w retencji, bezpieczeństwie i dowodach rozliczalności.",
      "Najlepsza reakcja to przegląd procesów, a nie jednorazowa aktualizacja dokumentu.",
    ],
    sections: [
      {
        id: "czytanie-decyzji",
        title: "Czytaj decyzje przez pryzmat procesu",
        body: [
          "Sama wysokość kary jest mniej ważna niż opis tego, jak doszło do naruszenia i czego zabrakło w organizacji.",
          "W praktyce warto szukać powtarzalnych elementów: brak procedury, zbyt szeroki dostęp, brak retencji lub brak dowodu wykonania obowiązku.",
        ],
      },
      {
        id: "kontrola",
        title: "Zamień wnioski na checklistę",
        body: [
          "Po każdej ważnej decyzji warto sprawdzić, czy analogiczny proces istnieje w Twojej firmie. Jeśli tak, porównaj go z wnioskami organu.",
          "Największą wartość dają krótkie działania: poprawa uprawnień, aktualizacja rejestru i dopisanie odpowiedzialności właściciela procesu.",
        ],
      },
      {
        id: "rozliczalnosc",
        title: "Rozliczalność wygrywa z deklaracją",
        body: [
          "W razie kontroli ważne jest nie tylko to, że firma ma procedurę, ale też czy potrafi pokazać jej działanie.",
          "Dlatego warto archiwizować przeglądy, decyzje o retencji, potwierdzenia szkoleń i testy reakcji na naruszenia.",
        ],
      },
    ],
    sources: [{ label: "UODO: decyzje i komunikaty", href: "https://uodo.gov.pl/pl/p/decyzje" }, gdprSource],
  },
  {
    slug: "umowa-powierzenia-danych-kiedy-potrzebna",
    title: "Umowa powierzenia danych: kiedy jest naprawdę potrzebna",
    excerpt:
      "Hosting, księgowość, newsletter i support. Sprawdź, z którymi dostawcami musisz podpisać umowę powierzenia i co w niej zawrzeć.",
    category: "rodo",
    author: "Maria Kowalska",
    authorInitials: "MK",
    date: "5 cze 2026",
    updated: "czerwiec 2026",
    readTime: "6 min",
    heroLabel: "Umowy i dostawcy",
    coverNote: "art. 28 RODO",
    summary: [
      "Umowa powierzenia jest potrzebna, gdy dostawca przetwarza dane w Twoim imieniu.",
      "Nie każdy kontrahent jest procesorem. Czasem działa jako osobny administrator.",
      "Najważniejsze elementy to zakres, cel, zabezpieczenia, podprocesorzy i zasady zwrotu lub usunięcia danych.",
    ],
    sections: [
      {
        id: "role",
        title: "Najpierw ustal role stron",
        body: [
          "Umowa powierzenia jest właściwa, gdy dostawca przetwarza dane na Twoje polecenie i dla Twojego celu.",
          "Jeśli kontrahent sam decyduje o celach i sposobach przetwarzania, może być osobnym administratorem, a wtedy potrzebna jest inna konstrukcja prawna.",
        ],
      },
      {
        id: "zakres",
        title: "Co powinno znaleźć się w DPA",
        body: [
          "Dobra umowa opisuje przedmiot, czas trwania, charakter i cel przetwarzania, kategorie danych, osoby, obowiązki procesora i zabezpieczenia.",
          "Nie pomijaj podprocesorów. To często tam pojawiają się transfery poza EOG albo dodatkowe ryzyka.",
        ],
      },
      {
        id: "utrzymanie",
        title: "DPA to dokument żywy",
        body: [
          "Zmiana dostawcy, planu usługi lub lokalizacji danych może wymagać aktualizacji umowy albo załączników.",
          "Warto prowadzić prostą listę dostawców z datą ostatniej weryfikacji.",
        ],
      },
    ],
    sources: [gdprSource],
  },
  {
    slug: "zgody-marketingowe-a-rodo",
    title: "Zgody marketingowe a RODO: jak zbierać je zgodnie z prawem",
    excerpt:
      "Checkbox, treść zgody, dowód jej udzielenia i możliwość wycofania. Jak projektować formularze, żeby zgoda działała.",
    category: "poradniki",
    author: "Anna Wójcik",
    authorInitials: "AW",
    date: "2 cze 2026",
    updated: "czerwiec 2026",
    readTime: "5 min",
    heroLabel: "Marketing",
    coverNote: "zgody i formularze",
    summary: [
      "Zgoda musi być dobrowolna, konkretna, świadoma i możliwa do wycofania.",
      "Checkbox nie powinien być domyślnie zaznaczony.",
      "Firma powinna umieć wykazać, kiedy i na co użytkownik wyraził zgodę.",
    ],
    sections: [
      {
        id: "tresc",
        title: "Treść zgody musi być konkretna",
        body: [
          "Użytkownik powinien wiedzieć, kto będzie się z nim kontaktował, jakim kanałem i w jakim celu.",
          "Łączenie wielu celów w jednym checkboxie utrudnia wykazanie, że zgoda była świadoma.",
        ],
      },
      {
        id: "dowod",
        title: "Zadbaj o dowód zgody",
        body: [
          "W systemie warto zapisać treść zgody, datę, źródło formularza i identyfikator użytkownika lub adres e-mail.",
          "Bez tego trudno obronić zgodę po kilku miesiącach, gdy zmieni się formularz albo kampania.",
        ],
      },
      {
        id: "wycofanie",
        title: "Wycofanie ma być równie proste",
        body: [
          "Każda komunikacja marketingowa powinna zawierać prosty sposób wycofania zgody lub sprzeciwu.",
          "Proces wypisu nie powinien wymagać logowania ani kontaktu z działem obsługi.",
        ],
      },
    ],
    sources: [gdprSource],
  },
  {
    slug: "iod-w-grupie-kapitalowej",
    title: "IOD w grupie kapitałowej: jeden inspektor dla wielu spółek",
    excerpt:
      "Kiedy jeden Inspektor może obsłużyć całą grupę i jak zapewnić mu realną dostępność wymaganą przez RODO.",
    category: "iod",
    author: "Tomasz Lis",
    authorInitials: "TL",
    date: "29 maj 2026",
    updated: "maj 2026",
    readTime: "7 min",
    heroLabel: "IOD w praktyce",
    coverNote: "grupa spółek",
    summary: [
      "Jeden IOD może obsługiwać grupę, jeśli jest łatwo dostępny dla każdej jednostki.",
      "Trzeba ustalić kanały kontaktu, zakres odpowiedzialności i niezależność IOD.",
      "W praktyce pomaga wspólny model raportowania i lokalni właściciele procesów.",
    ],
    sections: [
      {
        id: "dostepnosc",
        title: "Dostępność jest warunkiem, nie dodatkiem",
        body: [
          "IOD obsługujący kilka spółek musi być realnie dostępny dla organu, osób, których dane dotyczą, i pracowników.",
          "W praktyce oznacza to jasny adres kontaktowy, procedurę eskalacji i czas reakcji.",
        ],
      },
      {
        id: "niezaleznosc",
        title: "Uważaj na konflikt interesów",
        body: [
          "IOD nie powinien jednocześnie decydować o celach i sposobach przetwarzania danych.",
          "W grupie kapitałowej warto szczególnie uważać na role zarządcze, IT, HR i compliance.",
        ],
      },
      {
        id: "model",
        title: "Wspólny model, lokalne dane",
        body: [
          "Najlepiej działa połączenie wspólnych standardów grupy z lokalną wiedzą o procesach w każdej spółce.",
          "IOD może koordynować zgodność, ale właściciele procesów powinni odpowiadać za aktualność informacji.",
        ],
      },
    ],
    sources: [gdprSource, uodoDpoSource],
  },
  {
    slug: "analiza-ryzyka-i-dpia-krok-po-kroku",
    title: "Analiza ryzyka i DPIA: krok po kroku dla zespołu",
    excerpt:
      "Kiedy ocena skutków jest obowiązkowa, jak ją przeprowadzić i udokumentować bez angażowania całej firmy na tygodnie.",
    category: "rodo",
    author: "Paweł Nowak",
    authorInitials: "PN",
    date: "26 maj 2026",
    updated: "maj 2026",
    readTime: "9 min",
    heroLabel: "Ryzyko i DPIA",
    coverNote: "art. 35 RODO",
    summary: [
      "DPIA jest potrzebna przy wysokim ryzyku dla praw i wolności osób.",
      "Analiza powinna zaczynać się od opisu procesu, nie od tabeli ryzyk.",
      "Najważniejszy wynik to decyzje o zabezpieczeniach i akceptacji ryzyka.",
    ],
    sections: [
      {
        id: "opis-procesu",
        title: "Najpierw opisz proces",
        body: [
          "Zanim oceniasz ryzyko, ustal cel, dane, osoby, systemy, odbiorców i czas przechowywania.",
          "Bez tego analiza ryzyka staje się ćwiczeniem abstrakcyjnym i nie prowadzi do realnych decyzji.",
        ],
      },
      {
        id: "ryzyka",
        title: "Ryzyko patrzy z perspektywy osoby",
        body: [
          "W RODO ryzyko dotyczy praw i wolności osób, a nie tylko ryzyka biznesowego firmy.",
          "Oceniaj skutki takie jak ujawnienie danych, dyskryminacja, utrata kontroli nad danymi lub szkoda finansowa.",
        ],
      },
      {
        id: "decyzja",
        title: "Zakończ decyzją i planem",
        body: [
          "Analiza powinna kończyć się listą zabezpieczeń, właścicielem działań i decyzją, czy ryzyko jest akceptowalne.",
          "Jeśli ryzyko nadal jest wysokie, przed startem procesu może być potrzebna konsultacja z organem.",
        ],
      },
    ],
    sources: [gdprSource],
  },
  {
    slug: "ai-act-a-rodo-obowiazki-firm",
    title: "AI Act a RODO: gdzie przecinają się obowiązki firm",
    excerpt:
      "Nowe narzędzia AI nie zastępują obowiązków RODO. Sprawdź, gdzie spotykają się ocena ryzyka, transparentność i bezpieczeństwo danych.",
    category: "prawo",
    author: "Maria Kowalska",
    authorInitials: "MK",
    date: "22 maj 2026",
    updated: "maj 2026",
    readTime: "8 min",
    heroLabel: "AI i dane",
    coverNote: "AI governance",
    summary: [
      "Wdrożenie AI często oznacza nowe cele, odbiorców i ryzyka przetwarzania danych.",
      "RODO nadal wymaga podstawy prawnej, informacji dla osób i oceny ryzyka.",
      "Najbezpieczniej prowadzić wspólną checklistę AI, RODO i bezpieczeństwa.",
    ],
    sections: [
      {
        id: "dane",
        title: "AI zaczyna się od danych",
        body: [
          "Zanim wdrożysz narzędzie AI, ustal, jakie dane do niego trafiają, czy są danymi osobowymi i czy dostawca używa ich do trenowania modeli.",
          "To wpływa na klauzule informacyjne, umowy z dostawcą i ocenę transferów.",
        ],
      },
      {
        id: "transparentnosc",
        title: "Transparentność nie jest opcjonalna",
        body: [
          "Osoby powinny rozumieć, kiedy ich dane są używane w procesach wspieranych przez AI, zwłaszcza jeśli wpływa to na decyzje wobec nich.",
          "Komunikaty muszą być konkretne i zrozumiałe, a nie ukryte w ogólnym regulaminie.",
        ],
      },
      {
        id: "governance",
        title: "Połącz governance AI z RODO",
        body: [
          "Najlepsze wdrożenia mają wspólną listę kontrolną: cel, dane, dostawca, ryzyka, zabezpieczenia, właściciel procesu i przegląd okresowy.",
          "Dzięki temu AI nie działa poza systemem zgodności, tylko staje się jego częścią.",
        ],
      },
    ],
    sources: [gdprSource],
  },
];

export const featuredBlogArticle = blogArticles.find((article) => article.featured) ?? blogArticles[0];

export function getBlogArticle(slug: string) {
  return blogArticles.find((article) => article.slug === slug);
}

export function getRelatedArticles(article: BlogArticle, limit = 3) {
  const sameCategory = blogArticles.filter((item) => item.slug !== article.slug && item.category === article.category);
  const rest = blogArticles.filter((item) => item.slug !== article.slug && item.category !== article.category);

  return [...sameCategory, ...rest].slice(0, limit);
}
