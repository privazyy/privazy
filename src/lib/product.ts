export const privacyPolicyProduct = {
  name: "Polityka prywatności RODO",
  shortName: "Polityka prywatności",
  category: "Polityki",
  price: 190,
  currency: "PLN",
  canonicalPath: "/sklep/polityka-prywatnosci",
  url: "https://privazy.pl/sklep/polityka-prywatnosci",
  description:
    "Sandboxowa karta produktu polityki prywatności RODO. Ten etap pozwala utworzyć testowe zamówienie i płatność mock, ale nie dostarcza jeszcze dokumentu.",
  lead:
    "Demonstracyjny produkt dokumentowy połączony z bezpiecznym checkoutem mock. Generator, weryfikacja prawna i dostarczenie plików pozostają poza tym etapem.",
  metaTitle: "Polityka prywatności RODO - wzór dopasowany do firmy | PRIVAZY",
  metaDescription:
    "Sandboxowa karta produktu polityki prywatności RODO z testową ceną i checkoutem mock. Bez realnej sprzedaży, płatności i dostarczenia dokumentu.",
  priceNote: "Cena testowa netto · VAT liczony po stronie serwera · checkout sandbox",
  guarantee: "Sandbox — brak realnej sprzedaży i pobrania środków",
  paymentNote: "Jawna symulacja mock · bez karty, BLIK-a, przelewu i pobierania środków",
} as const;

export const productBundleItems = [
  "Planowany format: edytowalny DOCX",
  "Planowany format: PDF",
  "Planowany format: HTML",
  "Planowany materiał: instrukcja wdrożenia",
] as const;

export const productTrustItems = [
  {
    title: "Zakres demonstracyjny",
    text: "bez deklaracji zgodności dokumentu",
  },
  {
    title: "Checkout mock",
    text: "bez operatora i danych karty",
  },
  {
    title: "Cena serwerowa",
    text: "netto, VAT i brutto z bazy",
  },
  {
    title: "Brak automatycznej generacji",
    text: "po testowym PAID tylko status realizacji",
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
    title: "Dodaj produkt testowy",
    text: "Koszyk pobiera produkt i jego aktualną cenę z bazy, a nie z danych przeglądarki.",
  },
  {
    title: "Utwórz zamówienie sandbox",
    text: "Checkout waliduje dane i tworzy snapshot pozycji bez uruchamiania generatora dokumentu.",
  },
  {
    title: "Zasymuluj wynik płatności",
    text: "Mock success lub failure aktualizuje statusy bez pobierania środków i bez dostarczenia plików.",
  },
] as const;

export const productComparisonRows = [
  {
    label: "Tryb",
    privazy: "sandbox mock",
    template: "plik statyczny",
    lawyer: "usługa zewnętrzna",
  },
  {
    label: "Płatność",
    privazy: "bez środków",
    template: "poza systemem",
    lawyer: "poza systemem",
  },
  {
    label: "Generowanie dokumentu",
    privazy: "nie w tym etapie",
    template: "nie",
    lawyer: "nie dotyczy",
  },
  {
    label: "Status po mock success",
    privazy: "READY_FOR_INPUT z template",
    template: "nie dotyczy",
    lawyer: "nie dotyczy",
  },
  {
    label: "Gotowość produkcyjna",
    privazy: "nie",
    template: "nie dotyczy",
    lawyer: "poza oceną",
  },
] as const;

export const productFaqItems = [
  {
    question: "Czy dokument jest dopasowany do mojej branży?",
    answer:
      "Nie w tym etapie. Ten PR obejmuje wyłącznie katalog, koszyk, checkout i płatność mock. Formularz danych i generator wymagają osobnego, bezpiecznego przepływu.",
  },
  {
    question: "W jakim formacie otrzymam dokument?",
    answer:
      "Ten sandbox nie dostarcza dokumentu. DOCX, PDF, HTML i instrukcja są planowanymi formatami produktu, a nie wynikiem obecnej symulacji.",
  },
  {
    question: "Czy dostanę aktualizacje po zmianie przepisów?",
    answer:
      "Nie ma jeszcze mechanizmu aktualizacji ani aktywnej usługi. Takie zobowiązanie wymaga osobnego zakresu produktowego i prawnego.",
  },
  {
    question: "Czy mogę samodzielnie edytować dokument?",
    answer:
      "Sandbox nie generuje pliku. Edytowalny DOCX jest planowanym formatem przyszłego produktu.",
  },
  {
    question: "Czy zakup obejmuje politykę plików cookies?",
    answer:
      "Nie ma jeszcze realnego zakupu. Polityka cookies występuje w katalogu jako osobny produkt testowy.",
  },
  {
    question: "Czym to się różni od darmowego szablonu z internetu?",
    answer:
      "Obecny ekran demonstruje bezpieczny model commerce, a nie przewagę merytoryczną gotowego dokumentu. Personalizacja i review prawne nie są częścią tego PR.",
  },
] as const;

export const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: privacyPolicyProduct.name,
  description:
    "Sandboxowa karta produktu polityki prywatności RODO z testowym checkoutem mock.",
  brand: {
    "@type": "Brand",
    name: "PRIVAZY",
  },
  category: "Dokumenty RODO / Polityki",
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
