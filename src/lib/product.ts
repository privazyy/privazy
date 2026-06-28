export const privacyPolicyProduct = {
  name: "Polityka prywatności RODO",
  shortName: "Polityka prywatności",
  category: "Polityki",
  price: 190,
  currency: "PLN",
  canonicalPath: "/sklep/polityka-prywatnosci",
  url: "https://privazy.pl/sklep/polityka-prywatnosci",
  description:
    "Polityka prywatności zgodna z RODO, dopasowana do Twojej branży i kanałów zbierania danych. Pliki .docx, PDF i HTML, aktualizacje przepisów, natychmiastowy dostęp.",
  lead:
    "Dopasowana do Twojej branży i kanałów zbierania danych. Nie szablon z internetu, tylko dokument gotowy do wdrożenia na stronie i w firmie.",
  metaTitle: "Polityka prywatności RODO - wzór dopasowany do firmy | PRIVAZY",
  metaDescription:
    "Polityka prywatności zgodna z RODO, dopasowana do Twojej branży i kanałów zbierania danych. Pliki .docx, PDF i HTML, aktualizacje przepisów, natychmiastowy dostęp. 190 zł jednorazowo.",
  priceNote: "Cena netto · faktura VAT 23% · dożywotni dostęp do pliku",
  guarantee: "14 dni gwarancji zwrotu pieniędzy",
  paymentNote: "Bezpieczna płatność · BLIK, karta, przelew · natychmiastowy dostęp",
} as const;

export const productBundleItems = [
  "Plik .docx (edytowalny)",
  "PDF do podpisu",
  "Wersja HTML na WWW",
  "Instrukcja wdrożenia",
] as const;

export const productTrustItems = [
  {
    title: "Zgodne z RODO",
    text: "oraz ustawą o ochronie danych",
  },
  {
    title: "Tworzone przez prawników",
    text: "weryfikowane merytorycznie",
  },
  {
    title: "Aktualizacje przepisów",
    text: "przez 12 miesięcy",
  },
  {
    title: "Natychmiastowy dostęp",
    text: "pliki od razu po zakupie",
  },
] as const;

export const productContentItems = [
  {
    title: "Klauzula informacyjna",
    text: "zgodna z art. 13-14 RODO",
  },
  {
    title: "Cele i podstawy prawne",
    text: "przetwarzania danych",
  },
  {
    title: "Zakres zbieranych danych",
    text: "i źródła ich pozyskania",
  },
  {
    title: "Okresy przechowywania",
    text: "retencji danych",
  },
  {
    title: "Prawa osób",
    text: "których dane dotyczą, i sposób ich realizacji",
  },
  {
    title: "Odbiorcy i powierzenie",
    text: "danych zgodnie z art. 28 RODO",
  },
  {
    title: "Sekcja cookies",
    text: "i narzędzi analitycznych",
  },
  {
    title: "Dane kontaktowe",
    text: "administratora i opcjonalnie IOD",
  },
  {
    title: "Wersje plików",
    text: ".docx, PDF oraz HTML na stronę WWW",
  },
  {
    title: "Instrukcja wdrożenia",
    text: "krok po kroku",
  },
] as const;

export const productSteps = [
  {
    title: "Opisz swoją firmę",
    text: "Kilka pytań o branżę, kanały zbierania danych i używane narzędzia. Bez prawniczego żargonu.",
  },
  {
    title: "Generujemy dokument",
    text: "System tworzy politykę dopasowaną do profilu Twojej działalności - gotową w kilka minut.",
  },
  {
    title: "Pobierasz i wdrażasz",
    text: "Pliki .docx, PDF i HTML trafiają do Ciebie od razu. Publikujesz dokument na stronie i w firmie.",
  },
] as const;

export const productComparisonRows = [
  {
    label: "Cena",
    privazy: "190 zł",
    template: "0-50 zł",
    lawyer: "1 500-3 000 zł",
  },
  {
    label: "Czas",
    privazy: "kilka minut",
    template: "od ręki",
    lawyer: "kilka dni",
  },
  {
    label: "Dopasowanie do firmy",
    privazy: "tak",
    template: "nie",
    lawyer: "tak",
  },
  {
    label: "Zgodność z aktualnymi przepisami",
    privazy: "tak",
    template: "ryzyko",
    lawyer: "tak",
  },
  {
    label: "Aktualizacje przepisów",
    privazy: "tak",
    template: "nie",
    lawyer: "za dopłatą",
  },
] as const;

export const productFaqItems = [
  {
    question: "Czy dokument jest dopasowany do mojej branży?",
    answer:
      "Tak. Przed pobraniem wypełniasz krótki profil firmy: branżę, kanały zbierania danych i używane narzędzia. Na tej podstawie generujemy politykę uwzględniającą Twoją działalność, a nie ogólny wzór dla wszystkich.",
  },
  {
    question: "W jakim formacie otrzymam dokument?",
    answer:
      "Dostajesz edytowalny plik .docx, gotowy do podpisu PDF oraz wersję HTML do wklejenia bezpośrednio na stronę internetową. Do tego dołączamy krótką instrukcję wdrożenia.",
  },
  {
    question: "Czy dostanę aktualizacje po zmianie przepisów?",
    answer:
      "Tak. Przez 12 miesięcy od zakupu otrzymujesz zaktualizowane wersje dokumentu, jeśli zmienią się przepisy lub wytyczne UODO. Powiadomienie i nowy plik trafiają na Twój e-mail.",
  },
  {
    question: "Czy mogę samodzielnie edytować dokument?",
    answer:
      "Oczywiście. Plik .docx jest w pełni edytowalny - możesz dostosować dane firmy, uzupełnić szczegóły lub rozszerzyć wybrane sekcje.",
  },
  {
    question: "Czy zakup obejmuje politykę plików cookies?",
    answer:
      "Tak. Polityka prywatności zawiera sekcję dotyczącą plików cookies i narzędzi analitycznych. Jeśli potrzebujesz rozbudowanej, osobnej polityki cookies, znajdziesz ją również w naszym sklepie.",
  },
  {
    question: "Czym to się różni od darmowego szablonu z internetu?",
    answer:
      "Darmowe szablony są ogólne i często nieaktualne. Nie uwzględniają specyfiki Twojej firmy ani bieżących przepisów. Dokument PRIVAZY jest personalizowany, weryfikowany przez prawników i objęty aktualizacjami.",
  },
] as const;

export const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: privacyPolicyProduct.name,
  description:
    "Polityka prywatności zgodna z RODO, dopasowana do branży i kanałów zbierania danych firmy. Edytowalny plik .docx, PDF do podpisu oraz wersja HTML na stronę WWW.",
  brand: {
    "@type": "Brand",
    name: "PRIVAZY",
  },
  category: "Dokumenty RODO / Polityki",
  offers: {
    "@type": "Offer",
    price: String(privacyPolicyProduct.price),
    priceCurrency: privacyPolicyProduct.currency,
    availability: "https://schema.org/InStock",
    url: privacyPolicyProduct.url,
  },
} as const;

export const productFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: productFaqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
} as const;
