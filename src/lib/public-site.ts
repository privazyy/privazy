export const publicSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://privazy.pl").replace(/\/$/, "");

export type PublicFaq = {
  question: string;
  answer: string;
};

export type PublicLink = {
  label: string;
  href: string;
  description?: string;
};

export type PublicProcessStep = {
  title: string;
  description: string;
};

export type PublicService = {
  slug: string;
  path: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  badge: string;
  schemaType: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  painPoints: string[];
  outcomes: string[];
  scope: string[];
  process: PublicProcessStep[];
  faq: PublicFaq[];
  relatedServices: string[];
  relatedIndustries: string[];
  relatedArticles: string[];
};

export type PublicIndustry = {
  slug: string;
  path: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  badge: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  description: string;
  risks: string[];
  obligations: string[];
  iodContext: string;
  recommendedServices: string[];
  faq: PublicFaq[];
  relatedArticles: string[];
};

const defaultServiceProcess: PublicProcessStep[] = [
  {
    title: "Diagnoza",
    description: "Zbieramy informacje o firmie, procesach, danych, dostawcach i obecnej dokumentacji.",
  },
  {
    title: "Rekomendacja",
    description: "Pokazujemy, co jest wymagane, co jest ryzykiem i które działania mają pierwszeństwo.",
  },
  {
    title: "Wdrożenie",
    description: "Przygotowujemy dokumenty, procedury, instrukcje i praktyczny plan działania dla zespołu.",
  },
  {
    title: "Utrzymanie",
    description: "Pomagamy aktualizować dokumentację, obsługiwać incydenty i reagować na nowe procesy.",
  },
];

export const publicServices: PublicService[] = [
  {
    slug: "wdrozenie-rodo",
    path: "/uslugi/wdrozenie-rodo",
    title: "Wdrożenie RODO",
    shortTitle: "Wdrożenie RODO",
    eyebrow: "Usługa",
    badge: "start zgodności",
    schemaType: "Wdrożenie ochrony danych osobowych",
    metaTitle: "Wdrożenie RODO dla firm - PRIVAZY",
    metaDescription:
      "Wdrożenie RODO dla małych i średnich firm: analiza procesów, dokumentacja, procedury, rejestry i plan utrzymania zgodności.",
    heroTitle: "Wdrożenie RODO, które porządkuje realne procesy w firmie",
    description:
      "Pomagamy przejść od niepewności do praktycznego systemu ochrony danych: z rejestrem czynności, klauzulami, procedurami i jasnymi decyzjami dla zespołu.",
    primaryCta: "Porozmawiaj o wdrożeniu",
    secondaryCta: "Sprawdź obowiązek IOD",
    painPoints: [
      "dokumenty nie odzwierciedlają faktycznych procesów",
      "brakuje rejestru czynności albo jest nieaktualny",
      "firma korzysta z wielu dostawców SaaS bez uporządkowanych umów",
      "zespół nie wie, jak reagować na żądania osób i incydenty",
    ],
    outcomes: [
      "mapa procesów i danych osobowych",
      "komplet dokumentów dopasowanych do skali firmy",
      "procedury naruszeń i obsługi żądań osób",
      "lista działań utrzymaniowych po wdrożeniu",
    ],
    scope: [
      "analiza procesów sprzedaży, marketingu, HR, IT i obsługi klienta",
      "rejestr czynności przetwarzania oraz podstawy prawne",
      "klauzule informacyjne, upoważnienia, ewidencje i umowy powierzenia",
      "instrukcje dla pracowników oraz rekomendacje bezpieczeństwa",
    ],
    process: defaultServiceProcess,
    faq: [
      {
        question: "Czy wdrożenie RODO oznacza przygotowanie samych dokumentów?",
        answer:
          "Nie. Dokumenty są ważne, ale zaczynamy od procesów, danych i dostawców. Dopiero na tej podstawie przygotowujemy dokumentację i instrukcje.",
      },
      {
        question: "Ile trwa wdrożenie RODO?",
        answer:
          "Typowy zakres dla małej lub średniej firmy można rozpocząć w kilka dni roboczych. Czas zależy od liczby procesów, dostawców i skali danych.",
      },
      {
        question: "Czy po wdrożeniu mogę przejść na stałą obsługę?",
        answer:
          "Tak. Wdrożenie może być pierwszym etapem, po którym uruchamiamy outsourcing IOD albo okresowe wsparcie compliance.",
      },
    ],
    relatedServices: ["dokumentacja-rodo", "audyt-rodo", "outsourcing-iod"],
    relatedIndustries: ["ecommerce", "hr-i-rekrutacja", "saas-i-it"],
    relatedArticles: ["rodo-w-malej-firmie-minimum-do-wdrozenia", "rejestr-czynnosci-przetwarzania-bez-bledow"],
  },
  {
    slug: "outsourcing-iod",
    path: "/uslugi/outsourcing-iod",
    title: "Outsourcing IOD",
    shortTitle: "Outsourcing IOD",
    eyebrow: "Usługa",
    badge: "stały nadzór",
    schemaType: "Outsourcing Inspektora Ochrony Danych",
    metaTitle: "Outsourcing IOD dla firm - PRIVAZY",
    metaDescription:
      "Zewnętrzny Inspektor Ochrony Danych, obsługa incydentów, konsultacje, aktualizacja dokumentacji i wsparcie przed UODO.",
    heroTitle: "Zewnętrzny IOD dla firm, które potrzebują stałego nadzoru",
    description:
      "Przejmujemy funkcję IOD albo wspieramy osobę odpowiedzialną za RODO. Zapewniamy bieżące konsultacje, obsługę incydentów, przeglądy dokumentacji i kontakt z organem.",
    primaryCta: "Zapytaj o outsourcing IOD",
    secondaryCta: "Uruchom checker IOD",
    painPoints: [
      "firma ma obowiązek IOD, ale nie chce budować etatu",
      "incydenty i żądania osób trafiają do przypadkowych osób",
      "dokumentacja powstała jednorazowo i nie jest utrzymywana",
      "zarząd potrzebuje szybkiej konsultacji przy zmianach procesów",
    ],
    outcomes: [
      "wyznaczony punkt kontaktu dla spraw RODO",
      "procedura i kanał obsługi naruszeń ochrony danych",
      "regularne przeglądy dokumentacji i procesów",
      "wsparcie przy DPIA, kontrolach i zapytaniach UODO",
    ],
    scope: [
      "pełnienie funkcji zewnętrznego IOD albo wsparcie wewnętrznego zespołu",
      "obsługa naruszeń, żądań osób i konsultacji pracowniczych",
      "aktualizacja rejestrów, polityk i procedur",
      "raportowanie statusu spraw oraz rekomendacje działań",
    ],
    process: defaultServiceProcess,
    faq: [
      {
        question: "Czy zewnętrzny IOD może obsługiwać firmę zdalnie?",
        answer:
          "Tak. Większość spraw RODO można prowadzić zdalnie: przez spotkania online, korespondencję, platformę i dokumentację elektroniczną.",
      },
      {
        question: "Czy outsourcing IOD obejmuje incydenty?",
        answer:
          "Tak. Wspieramy ocenę naruszenia, dokumentację, decyzję o zgłoszeniu do UODO i komunikację z osobami, jeśli jest wymagana.",
      },
      {
        question: "Czy każda firma musi powołać IOD?",
        answer:
          "Nie. Obowiązek zależy od roli, charakteru organizacji, skali monitorowania i rodzaju danych. Dlatego utrzymujemy checker IOD jako pierwszy krok.",
      },
    ],
    relatedServices: ["audyt-rodo", "naruszenia-ochrony-danych", "zadania-osob"],
    relatedIndustries: ["placowki-medyczne", "szkoly-i-przedszkola", "kancelarie"],
    relatedArticles: ["czy-musisz-powolac-inspektora-ochrony-danych", "iod-w-grupie-kapitalowej"],
  },
  {
    slug: "audyt-rodo",
    path: "/uslugi/audyt-rodo",
    title: "Audyt RODO",
    shortTitle: "Audyt RODO",
    eyebrow: "Usługa",
    badge: "kontrola zgodności",
    schemaType: "Audyt zgodności z RODO",
    metaTitle: "Audyt RODO dla firm - PRIVAZY",
    metaDescription:
      "Audyt RODO: przegląd dokumentacji, rejestrów, dostawców, procesów i ryzyk z praktyczną listą rekomendacji.",
    heroTitle: "Audyt RODO, który pokazuje realne braki i priorytety",
    description:
      "Sprawdzamy, czy dokumentacja i procesy ochrony danych odpowiadają temu, jak firma działa naprawdę. Wynikiem jest konkretna lista działań, a nie abstrakcyjny raport.",
    primaryCta: "Zaplanuj audyt",
    secondaryCta: "Zobacz wdrożenie",
    painPoints: [
      "firma nie wie, czy dokumenty są aktualne",
      "brakuje dowodów decyzji compliance",
      "dostawcy i transfery danych nie są uporządkowane",
      "zmieniły się procesy, systemy albo skala działalności",
    ],
    outcomes: [
      "ocena poziomu zgodności i ryzyk",
      "lista braków podzielona według priorytetów",
      "rekomendacje dla dokumentacji, dostawców i bezpieczeństwa",
      "plan naprawczy dla zarządu lub właściciela procesu",
    ],
    scope: [
      "przegląd polityk, rejestrów, klauzul, upoważnień i umów powierzenia",
      "weryfikacja dostawców, transferów i retencji",
      "ocena procedury naruszeń i obsługi praw osób",
      "warsztat podsumowujący z rekomendacjami",
    ],
    process: defaultServiceProcess,
    faq: [
      {
        question: "Czy audyt RODO kończy się raportem?",
        answer:
          "Tak, ale raport jest praktyczny: pokazuje braki, poziom ryzyka, priorytet i rekomendowane działania.",
      },
      {
        question: "Kiedy warto zrobić audyt RODO?",
        answer:
          "Po wdrożeniu nowych systemów, przy wzroście skali, przed kontrolą, po incydencie albo gdy dokumentacja nie była aktualizowana od dłuższego czasu.",
      },
      {
        question: "Czy audyt można połączyć z wdrożeniem?",
        answer:
          "Tak. Audyt często jest pierwszym etapem wdrożenia albo porządkowania dokumentacji.",
      },
    ],
    relatedServices: ["wdrozenie-rodo", "dokumentacja-rodo", "naruszenia-ochrony-danych"],
    relatedIndustries: ["saas-i-it", "ecommerce", "hr-i-rekrutacja"],
    relatedArticles: ["analiza-ryzyka-i-dpia-krok-po-kroku", "kary-uodo-w-2025-wnioski-dla-firm"],
  },
  {
    slug: "dokumentacja-rodo",
    path: "/uslugi/dokumentacja-rodo",
    title: "Dokumentacja RODO",
    shortTitle: "Dokumentacja RODO",
    eyebrow: "Usługa",
    badge: "dokumenty i procedury",
    schemaType: "Przygotowanie dokumentacji RODO",
    metaTitle: "Dokumentacja RODO dla firm - PRIVAZY",
    metaDescription:
      "Dokumentacja RODO dla firm: polityki, rejestry, klauzule, upoważnienia, umowy powierzenia, DPIA i procedury.",
    heroTitle: "Dokumentacja RODO dopasowana do firmy, nie do szablonu",
    description:
      "Przygotowujemy dokumenty, które da się wdrożyć w codziennej pracy: od polityki i rejestru czynności po procedury naruszeń, DPIA i obsługę żądań osób.",
    primaryCta: "Dobierz dokumenty",
    secondaryCta: "Zobacz sklep",
    painPoints: [
      "firma ma pojedyncze wzory, ale brakuje spójnego kompletu",
      "klauzule informacyjne nie pasują do faktycznych procesów",
      "brakuje rejestru czynności albo umów powierzenia",
      "pracownicy nie mają prostych instrukcji działania",
    ],
    outcomes: [
      "komplet dokumentów dobrany do branży i skali",
      "spójne klauzule, rejestry i procedury",
      "instrukcja wdrożenia dokumentów w firmie",
      "rekomendacja, kiedy potrzebny jest audyt lub IOD",
    ],
    scope: [
      "polityka ochrony danych, rejestr czynności i rejestr kategorii",
      "klauzule informacyjne, zgody i upoważnienia",
      "umowy powierzenia oraz lista dostawców",
      "procedury naruszeń, żądań osób, retencji i DPIA",
    ],
    process: defaultServiceProcess,
    faq: [
      {
        question: "Czy dokumentacja RODO może być kupiona jako pojedynczy dokument?",
        answer:
          "Tak. Można zacząć od pojedynczego dokumentu, a później rozbudować zestaw o procedury i rejestry.",
      },
      {
        question: "Czy dokumenty są sprawdzane przez człowieka?",
        answer:
          "Tak. Dokumenty przygotowujemy na bazie sprawdzonych wzorów i weryfikujemy je przed przekazaniem.",
      },
      {
        question: "Czy dokumentacja wystarczy bez wdrożenia?",
        answer:
          "Dokumentacja jest podstawą, ale zgodność wymaga także wdrożenia zasad w procesach i utrzymania ich na bieżąco.",
      },
    ],
    relatedServices: ["wdrozenie-rodo", "audyt-rodo", "zadania-osob"],
    relatedIndustries: ["ecommerce", "szkoly-i-przedszkola", "saas-i-it"],
    relatedArticles: ["rejestr-czynnosci-przetwarzania-bez-bledow", "umowa-powierzenia-danych-kiedy-potrzebna"],
  },
  {
    slug: "naruszenia-ochrony-danych",
    path: "/uslugi/naruszenia-ochrony-danych",
    title: "Naruszenia ochrony danych",
    shortTitle: "Naruszenia danych",
    eyebrow: "Usługa",
    badge: "reakcja 72h",
    schemaType: "Obsługa naruszeń ochrony danych",
    metaTitle: "Naruszenia ochrony danych - obsługa incydentów RODO",
    metaDescription:
      "Wsparcie przy naruszeniach ochrony danych: ocena ryzyka, dokumentacja, decyzja o zgłoszeniu do UODO i komunikacja z osobami.",
    heroTitle: "Obsługa naruszeń ochrony danych bez paniki i chaosu",
    description:
      "Pomagamy ocenić incydent, zebrać fakty, udokumentować decyzje i dotrzymać terminów. Wspieramy także przygotowanie procedury, aby kolejny incydent miał jasną ścieżkę.",
    primaryCta: "Skonsultuj incydent",
    secondaryCta: "Przygotuj procedurę",
    painPoints: [
      "nie wiadomo, czy incydent jest naruszeniem w rozumieniu RODO",
      "termin 72 godzin biegnie, a brakuje faktów",
      "firma nie ma procedury ani wzoru rejestru naruszeń",
      "zespół nie wie, kto podejmuje decyzję o zgłoszeniu",
    ],
    outcomes: [
      "ocena ryzyka naruszenia i rekomendacja dalszych kroków",
      "notatka decyzyjna oraz wpis do rejestru naruszeń",
      "wsparcie przy zgłoszeniu do UODO i komunikacji z osobami",
      "procedura reakcji i instrukcja dla zespołu",
    ],
    scope: [
      "ustalenie faktów, kategorii danych i skali incydentu",
      "ocena prawdopodobieństwa ryzyka dla praw i wolności osób",
      "przygotowanie dokumentacji naruszenia oraz zgłoszenia",
      "rekomendacje naprawcze po incydencie",
    ],
    process: defaultServiceProcess,
    faq: [
      {
        question: "Czy każde naruszenie trzeba zgłosić do UODO?",
        answer:
          "Nie. Decyduje poziom ryzyka dla praw i wolności osób. Każde naruszenie powinno być jednak ocenione i udokumentowane.",
      },
      {
        question: "Od kiedy liczy się termin 72 godzin?",
        answer:
          "Termin liczy się od stwierdzenia naruszenia przez administratora. Dlatego szybkie zebranie faktów jest kluczowe.",
      },
      {
        question: "Czy pomagacie przygotować procedurę naruszeń?",
        answer:
          "Tak. Możemy przygotować procedurę, rejestr, wzory komunikatów i instrukcję postępowania dla pracowników.",
      },
    ],
    relatedServices: ["outsourcing-iod", "audyt-rodo", "dokumentacja-rodo"],
    relatedIndustries: ["placowki-medyczne", "ecommerce", "saas-i-it"],
    relatedArticles: ["kary-uodo-w-2025-wnioski-dla-firm", "analiza-ryzyka-i-dpia-krok-po-kroku"],
  },
  {
    slug: "zadania-osob",
    path: "/uslugi/zadania-osob",
    title: "Obsługa żądań osób",
    shortTitle: "Żądania osób",
    eyebrow: "Usługa",
    badge: "prawa osób",
    schemaType: "Obsługa praw osób, których dane dotyczą",
    metaTitle: "Obsługa żądań osób z RODO - PRIVAZY",
    metaDescription:
      "Procedury i wsparcie przy żądaniach osób: dostęp, usunięcie, sprostowanie, sprzeciw, przenoszenie i ograniczenie przetwarzania.",
    heroTitle: "Obsługa żądań osób z RODO bez zgadywania i opóźnień",
    description:
      "Pomagamy przygotować procedurę i prowadzić sprawy dotyczące praw osób: od weryfikacji tożsamości po odpowiedź, rejestr i decyzję o zakresie realizacji żądania.",
    primaryCta: "Ułóż proces obsługi żądań",
    secondaryCta: "Zobacz procedurę",
    painPoints: [
      "wnioski klientów trafiają do różnych skrzynek i osób",
      "zespół nie wie, kiedy można odmówić albo ograniczyć zakres",
      "brakuje rejestru żądań i terminów",
      "odpowiedzi są tworzone od zera za każdym razem",
    ],
    outcomes: [
      "procedura obsługi żądań osób",
      "rejestr spraw, terminów i decyzji",
      "wzory odpowiedzi i instrukcja weryfikacji tożsamości",
      "rekomendacje dla systemów i procesów klienta",
    ],
    scope: [
      "dostęp do danych, sprostowanie, usunięcie i ograniczenie",
      "sprzeciw, przenoszenie danych i cofnięcie zgody",
      "weryfikacja tożsamości oraz zakres odpowiedzi",
      "koordynacja z dostawcami i systemami źródłowymi",
    ],
    process: defaultServiceProcess,
    faq: [
      {
        question: "Ile czasu ma firma na odpowiedź na żądanie?",
        answer:
          "Zasadą jest miesiąc od otrzymania żądania, z możliwością przedłużenia w bardziej złożonych sprawach. Decyzję trzeba udokumentować.",
      },
      {
        question: "Czy zawsze trzeba usunąć dane na żądanie?",
        answer:
          "Nie. Czasem dane muszą zostać zachowane z powodu obowiązków prawnych, roszczeń lub innych podstaw. Odpowiedź powinna to jasno wyjaśniać.",
      },
      {
        question: "Czy obsługa żądań jest częścią outsourcingu IOD?",
        answer:
          "Tak, może być częścią stałej obsługi. Możemy też przygotować samą procedurę i wzory odpowiedzi.",
      },
    ],
    relatedServices: ["outsourcing-iod", "dokumentacja-rodo", "wdrozenie-rodo"],
    relatedIndustries: ["ecommerce", "hr-i-rekrutacja", "kancelarie"],
    relatedArticles: ["rodo-w-malej-firmie-minimum-do-wdrozenia", "rejestr-czynnosci-przetwarzania-bez-bledow"],
  },
];

export const publicIndustries: PublicIndustry[] = [
  {
    slug: "placowki-medyczne",
    path: "/branze/placowki-medyczne",
    title: "Placówki medyczne",
    shortTitle: "Medycyna",
    eyebrow: "Branża",
    badge: "dane o zdrowiu",
    metaTitle: "RODO dla placówek medycznych - PRIVAZY",
    metaDescription:
      "RODO dla placówek medycznych: dane o zdrowiu, IOD, DPIA, dokumentacja, naruszenia i prawa pacjentów.",
    heroTitle: "RODO dla placówek medycznych i podmiotów leczniczych",
    description:
      "Dane o zdrowiu należą do danych szczególnych kategorii. Dlatego placówki medyczne potrzebują uporządkowanej dokumentacji, procedur i często pogłębionej oceny obowiązku IOD.",
    risks: [
      "duża skala danych o zdrowiu i historii leczenia",
      "dostęp personelu, recepcji, podwykonawców i systemów medycznych",
      "naruszenia związane z wysyłką dokumentacji i dostępem do systemów",
      "żądania pacjentów dotyczące dostępu i sprostowania danych",
    ],
    obligations: [
      "rejestr czynności, upoważnienia i ewidencja dostępu",
      "procedura naruszeń oraz dokumentowanie decyzji",
      "umowy powierzenia z dostawcami systemów i usług",
      "ocena DPIA przy procesach wysokiego ryzyka",
    ],
    iodContext:
      "W placówkach medycznych obowiązek IOD może wynikać z przetwarzania danych o zdrowiu na dużą skalę albo charakteru podmiotu. Wynik zawsze wymaga sprawdzenia skali i roli organizacji.",
    recommendedServices: ["outsourcing-iod", "audyt-rodo", "naruszenia-ochrony-danych"],
    faq: [
      {
        question: "Czy każda placówka medyczna musi mieć IOD?",
        answer:
          "Nie zawsze, ale dane o zdrowiu i skala działalności bardzo często wymagają dokładnej analizy obowiązku IOD.",
      },
      {
        question: "Czy dokumentacja medyczna wymaga DPIA?",
        answer:
          "DPIA jest zwykle rozważana przy przetwarzaniu wysokiego ryzyka, zwłaszcza gdy skala, systemy lub dostęp do danych są istotne.",
      },
    ],
    relatedArticles: ["czy-musisz-powolac-inspektora-ochrony-danych", "analiza-ryzyka-i-dpia-krok-po-kroku"],
  },
  {
    slug: "szkoly-i-przedszkola",
    path: "/branze/szkoly-i-przedszkola",
    title: "Szkoły i przedszkola",
    shortTitle: "Edukacja",
    eyebrow: "Branża",
    badge: "dane dzieci",
    metaTitle: "RODO dla szkół i przedszkoli - PRIVAZY",
    metaDescription:
      "RODO dla szkół i przedszkoli: dane dzieci, rodziców, pracowników, upoważnienia, procedury i naruszenia.",
    heroTitle: "RODO dla szkół, przedszkoli i placówek opiekuńczych",
    description:
      "Placówki edukacyjne przetwarzają dane dzieci, rodziców, pracowników i kontrahentów. Potrzebują prostych procedur, jasnych upoważnień i bezpiecznego obiegu informacji.",
    risks: [
      "dane dzieci i rodziców w wielu systemach i dokumentach",
      "publikacja zdjęć, zgody i komunikacja z opiekunami",
      "dostęp pracowników i podmiotów zewnętrznych",
      "incydenty związane z pocztą, dziennikiem elektronicznym i dokumentacją",
    ],
    obligations: [
      "klauzule informacyjne i zasady zgód",
      "upoważnienia, ewidencja i instrukcje dla personelu",
      "procedura naruszeń oraz obsługi praw osób",
      "umowy powierzenia z dostawcami systemów edukacyjnych",
    ],
    iodContext:
      "Placówki publiczne zwykle wymagają IOD jako podmioty publiczne. W placówkach niepublicznych trzeba ocenić skalę, charakter danych i przepisy szczególne.",
    recommendedServices: ["wdrozenie-rodo", "dokumentacja-rodo", "outsourcing-iod"],
    faq: [
      {
        question: "Czy przedszkole niepubliczne musi mieć IOD?",
        answer:
          "To zależy od formy organizacji, skali i procesów. Publiczny charakter podmiotu oraz dane dzieci wymagają szczególnej analizy.",
      },
      {
        question: "Czy zgody na zdjęcia wystarczą jako dokumentacja RODO?",
        answer:
          "Nie. Zgody są tylko jednym elementem. Potrzebne są także klauzule, rejestry, upoważnienia, procedury i umowy z dostawcami.",
      },
    ],
    relatedArticles: ["rodo-w-malej-firmie-minimum-do-wdrozenia", "umowa-powierzenia-danych-kiedy-potrzebna"],
  },
  {
    slug: "ecommerce",
    path: "/branze/ecommerce",
    title: "E-commerce",
    shortTitle: "E-commerce",
    eyebrow: "Branża",
    badge: "sklep online",
    metaTitle: "RODO dla e-commerce - PRIVAZY",
    metaDescription:
      "RODO dla sklepów internetowych: polityka prywatności, marketing, profilowanie, dostawcy SaaS, żądania klientów i naruszenia.",
    heroTitle: "RODO dla e-commerce, marketplace i usług online",
    description:
      "Sklepy internetowe przetwarzają dane klientów, zamówień, płatności, reklamacji i marketingu. Zgodność zależy od spójnych klauzul, dostawców i procesu obsługi praw osób.",
    risks: [
      "wiele dostawców: płatności, hosting, mailing, CRM i analityka",
      "zgody marketingowe, newsletter i profilowanie",
      "transfery danych poza EOG przy narzędziach SaaS",
      "żądania usunięcia danych i sprzeciwy wobec marketingu",
    ],
    obligations: [
      "polityka prywatności i klauzule dla klientów",
      "rejestr czynności, lista dostawców i umowy powierzenia",
      "procedura obsługi żądań osób i retencji danych",
      "weryfikacja cookies, marketingu i transferów",
    ],
    iodContext:
      "Sam sklep internetowy nie zawsze oznacza obowiązek IOD. Ryzyko rośnie przy dużej skali, profilowaniu, monitorowaniu zachowań i danych szczególnych kategorii.",
    recommendedServices: ["dokumentacja-rodo", "zadania-osob", "audyt-rodo"],
    faq: [
      {
        question: "Czy sklep internetowy musi mieć politykę prywatności?",
        answer:
          "Tak. Klienci muszą dostać jasną informację o administratorze, celach, podstawach, odbiorcach, retencji i swoich prawach.",
      },
      {
        question: "Czy newsletter wymaga zgody?",
        answer:
          "W praktyce newsletter wymaga prawidłowej podstawy dla komunikacji marketingowej oraz jasnego mechanizmu zapisu i wypisu.",
      },
    ],
    relatedArticles: ["zgody-marketingowe-a-rodo", "transfery-danych-do-usa-w-2026-checklista"],
  },
  {
    slug: "kancelarie",
    path: "/branze/kancelarie",
    title: "Kancelarie",
    shortTitle: "Kancelarie",
    eyebrow: "Branża",
    badge: "sprawy klientów",
    metaTitle: "RODO dla kancelarii - PRIVAZY",
    metaDescription:
      "RODO dla kancelarii prawnych i firm odszkodowawczych: dane klientów, sprawy, dokumentacja, retencja, dostawcy i IOD.",
    heroTitle: "RODO dla kancelarii i firm obsługujących sprawy klientów",
    description:
      "Kancelarie i firmy odszkodowawcze przetwarzają obszerne dane klientów, dokumenty spraw i często dane szczególnych kategorii. Kluczowe są retencja, upoważnienia i bezpieczeństwo dostępu.",
    risks: [
      "dane o sprawach, zdrowiu, finansach i sytuacji rodzinnej",
      "duża liczba dokumentów oraz załączników od klientów",
      "współpraca z biegłymi, podwykonawcami i dostawcami IT",
      "retencja akt i żądania osób po zakończeniu sprawy",
    ],
    obligations: [
      "rejestry, klauzule i zasady retencji akt",
      "upoważnienia i kontrola dostępu do spraw",
      "umowy powierzenia i weryfikacja dostawców",
      "procedura naruszeń oraz obsługi praw osób",
    ],
    iodContext:
      "Obowiązek IOD zależy od skali i tego, czy główna działalność obejmuje przetwarzanie danych szczególnych kategorii albo monitorowanie na dużą skalę.",
    recommendedServices: ["audyt-rodo", "dokumentacja-rodo", "outsourcing-iod"],
    faq: [
      {
        question: "Czy kancelaria musi mieć IOD?",
        answer:
          "Nie zawsze. Trzeba ocenić skalę, rodzaj danych, główną działalność i powtarzalność procesów.",
      },
      {
        question: "Czy akta spraw wymagają osobnej retencji?",
        answer:
          "Tak. Retencja powinna wynikać z przepisów, umów, roszczeń i zasad bezpieczeństwa dokumentacji.",
      },
    ],
    relatedArticles: ["czy-musisz-powolac-inspektora-ochrony-danych", "rejestr-czynnosci-przetwarzania-bez-bledow"],
  },
  {
    slug: "hr-i-rekrutacja",
    path: "/branze/hr-i-rekrutacja",
    title: "HR i rekrutacja",
    shortTitle: "HR",
    eyebrow: "Branża",
    badge: "pracownicy i kandydaci",
    metaTitle: "RODO dla HR i rekrutacji - PRIVAZY",
    metaDescription:
      "RODO dla działów HR i firm rekrutacyjnych: kandydaci, pracownicy, zgody, retencja CV, dostawcy i procedury.",
    heroTitle: "RODO dla HR, rekrutacji i obsługi pracowników",
    description:
      "Procesy HR obejmują kandydatów, pracowników, zleceniobiorców, badania, benefity i dokumentację kadrową. Potrzebne są jasne podstawy, retencja i instrukcje dla zespołu.",
    risks: [
      "CV i zgody na przyszłe rekrutacje",
      "dane pracownicze, benefity, badania i absencje",
      "dostęp menedżerów, agencji i dostawców HR",
      "retencja dokumentacji po zakończeniu rekrutacji lub zatrudnienia",
    ],
    obligations: [
      "klauzule dla kandydatów, pracowników i współpracowników",
      "retencja CV i dokumentacji kadrowej",
      "upoważnienia, ewidencje i umowy powierzenia",
      "procedura obsługi żądań osób i incydentów",
    ],
    iodContext:
      "Sam HR nie przesądza o IOD, ale firmy rekrutacyjne i podmioty obsługujące wielu klientów powinny sprawdzić skalę, role i charakter przetwarzania.",
    recommendedServices: ["wdrozenie-rodo", "zadania-osob", "dokumentacja-rodo"],
    faq: [
      {
        question: "Czy można przechowywać CV po zakończeniu rekrutacji?",
        answer:
          "Tak, ale wymaga to prawidłowej podstawy, jasnej informacji i określonego czasu retencji.",
      },
      {
        question: "Czy agencja rekrutacyjna jest administratorem czy procesorem?",
        answer:
          "To zależy od modelu współpracy i decyzji o celach oraz sposobach przetwarzania. Warto opisać role w umowie.",
      },
    ],
    relatedArticles: ["rodo-w-malej-firmie-minimum-do-wdrozenia", "umowa-powierzenia-danych-kiedy-potrzebna"],
  },
  {
    slug: "saas-i-it",
    path: "/branze/saas-i-it",
    title: "SaaS i IT",
    shortTitle: "SaaS i IT",
    eyebrow: "Branża",
    badge: "technologia i dane",
    metaTitle: "RODO dla SaaS i firm IT - PRIVAZY",
    metaDescription:
      "RODO dla SaaS i IT: powierzenie, podprocesorzy, transfery danych, bezpieczeństwo, DPIA, AI i dokumentacja.",
    heroTitle: "RODO dla SaaS, software house i firm IT",
    description:
      "Firmy technologiczne często działają jako procesorzy, administratorzy albo oba podmioty naraz. Kluczowe są role, DPA, podprocesorzy, transfery i dowód należytej staranności.",
    risks: [
      "niejasne role administratora i procesora",
      "podprocesorzy, hosting, logi i transfery poza EOG",
      "AI, analityka, monitoring użytkowników i dane telemetryczne",
      "incydenty bezpieczeństwa oraz obowiązki wobec klientów",
    ],
    obligations: [
      "umowy powierzenia, lista podprocesorów i procedura zmian",
      "rejestr kategorii czynności dla procesora",
      "ocena transferów, bezpieczeństwa i retencji logów",
      "procedura incydentów oraz wsparcie klientów przy żądaniach osób",
    ],
    iodContext:
      "SaaS może wymagać IOD przy monitorowaniu użytkowników na dużą skalę, danych szczególnych kategorii albo obsłudze wielu klientów w podobnych procesach.",
    recommendedServices: ["audyt-rodo", "dokumentacja-rodo", "naruszenia-ochrony-danych"],
    faq: [
      {
        question: "Czy SaaS zawsze jest procesorem?",
        answer:
          "Nie. Dostawca SaaS może być procesorem, administratorem albo działać w różnych rolach dla różnych danych i funkcji.",
      },
      {
        question: "Czy transfery do USA trzeba dokumentować?",
        answer:
          "Tak. Przy dostawcach spoza EOG warto dokumentować podstawę transferu, podprocesorów i ocenę ryzyka.",
      },
    ],
    relatedArticles: ["transfery-danych-do-usa-w-2026-checklista", "ai-act-a-rodo-obowiazki-firm"],
  },
];

export const publicSiteFeaturedLinks: PublicLink[] = [
  {
    label: "Checker obowiązku IOD",
    href: "/#checker",
    description: "Szybka ocena przesłanek z art. 37 RODO i dalszych kroków.",
  },
  {
    label: "Sklep z dokumentami",
    href: "/sklep/polityka-prywatnosci",
    description: "Pierwszy dokument jako wejście do uporządkowanej dokumentacji.",
  },
  {
    label: "Blog RODO",
    href: "/blog",
    description: "Praktyczne poradniki o IOD, dokumentacji, incydentach i dostawcach.",
  },
];

export function getPublicService(slug: string) {
  return publicServices.find((service) => service.slug === slug);
}

export function getPublicIndustry(slug: string) {
  return publicIndustries.find((industry) => industry.slug === slug);
}

export function getPublicSiteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${publicSiteUrl}${normalizedPath}`;
}
