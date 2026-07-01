import { calculateGrossFromNet } from "@/lib/shop/money";

export type StarterProduct = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  priceNetCents: number;
  vatRateBps: number;
  currency: "PLN";
  productType: "DOCUMENT" | "PACKAGE" | "SERVICE" | "SUBSCRIPTION" | "TEMPLATE";
  includedFiles: string[];
  expectedDelivery: string;
  legalDisclaimer: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  metadata?: {
    badge?: string;
    recommendedFor?: string[];
    routeHint?: string;
  };
};

const disclaimer =
  "Dokument ma charakter wzoru i wymaga uzupełnienia danymi organizacji. Nie stanowi indywidualnej porady prawnej ani gwarancji zgodności z RODO.";

export const starterProducts: StarterProduct[] = [
  {
    name: "Polityka prywatności RODO",
    slug: "polityka-prywatnosci",
    shortDescription: "Polityka prywatności dla strony www, aplikacji lub sklepu.",
    description:
      "Dokument obejmuje administratora, cele, podstawy prawne, odbiorców, retencję, prawa osób, cookies i transfery. Po zakupie klient uzupełni formularz danych w Fazie 6.",
    priceNetCents: 19000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "DOCUMENT",
    includedFiles: ["DOCX", "PDF", "HTML", "Instrukcja wdrożenia"],
    expectedDelivery: "Formularz danych po opłaceniu zamówienia. Generowanie dokumentu w Fazie 6.",
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
    metadata: { badge: "najczęściej wybierany", recommendedFor: ["strona www", "e-commerce", "SaaS"] },
  },
  {
    name: "Polityka cookies",
    slug: "polityka-cookies",
    shortDescription: "Zasady cookies, analityki i narzędzi marketingowych.",
    description:
      "Dokument porządkuje typy cookies, narzędzia, okresy działania i informacje dla użytkowników strony.",
    priceNetCents: 12000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "DOCUMENT",
    includedFiles: ["DOCX", "PDF", "HTML"],
    expectedDelivery: "Formularz danych po opłaceniu zamówienia. Generowanie dokumentu w Fazie 6.",
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
    metadata: { recommendedFor: ["strona www", "marketing"] },
  },
  {
    name: "Polityka ochrony danych osobowych",
    slug: "polityka-ochrony-danych-osobowych",
    shortDescription: "Wewnętrzna polityka ochrony danych dla organizacji.",
    description:
      "Główny dokument organizacyjny opisujący role, zasady dostępu, bezpieczeństwo i odpowiedzialności w firmie.",
    priceNetCents: 29000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "DOCUMENT",
    includedFiles: ["DOCX", "PDF", "Instrukcja wdrożenia"],
    expectedDelivery: "Formularz danych po opłaceniu zamówienia. Generowanie dokumentu w Fazie 6.",
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
  },
  {
    name: "Rejestr czynności przetwarzania",
    slug: "rejestr-czynnosci-przetwarzania",
    shortDescription: "RCP z procesami, podstawami, odbiorcami i retencją.",
    description:
      "Struktura rejestru czynności przetwarzania wraz z instrukcją opisu procesów i danych.",
    priceNetCents: 24000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "DOCUMENT",
    includedFiles: ["XLSX", "DOCX", "Instrukcja"],
    expectedDelivery: "Formularz danych po opłaceniu zamówienia. Generowanie dokumentu w Fazie 6.",
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
  },
  {
    name: "Procedura naruszeń ochrony danych",
    slug: "procedura-naruszen-ochrony-danych",
    shortDescription: "Procedura reakcji na incydenty i termin 72 godzin.",
    description:
      "Kroki oceny naruszenia, dokumentowania decyzji, zgłoszenia do UODO i komunikacji z osobami.",
    priceNetCents: 26000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "DOCUMENT",
    includedFiles: ["DOCX", "PDF", "Rejestr naruszeń"],
    expectedDelivery: "Formularz danych po opłaceniu zamówienia. Generowanie dokumentu w Fazie 6.",
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
  },
  {
    name: "Procedura obsługi żądań osób",
    slug: "procedura-obslugi-zadan-osob",
    shortDescription: "Dostęp, usunięcie, sprostowanie, sprzeciw i terminy.",
    description:
      "Procedura obsługi praw osób, rejestr spraw, wzory odpowiedzi i instrukcja weryfikacji tożsamości.",
    priceNetCents: 22000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "DOCUMENT",
    includedFiles: ["DOCX", "PDF", "Wzory odpowiedzi"],
    expectedDelivery: "Formularz danych po opłaceniu zamówienia. Generowanie dokumentu w Fazie 6.",
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
  },
  {
    name: "Umowa powierzenia przetwarzania",
    slug: "umowa-powierzenia-przetwarzania",
    shortDescription: "DPA dla dostawców, procesorów i podprocesorów.",
    description:
      "Umowa powierzenia z zakresem danych, środkami bezpieczeństwa, audytem, podprocesorami i zakończeniem współpracy.",
    priceNetCents: 19000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "DOCUMENT",
    includedFiles: ["DOCX", "PDF"],
    expectedDelivery: "Formularz danych po opłaceniu zamówienia. Generowanie dokumentu w Fazie 6.",
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
  },
  {
    name: "Upoważnienia i ewidencja upoważnień",
    slug: "upowaznienia-i-ewidencja-upowaznien",
    shortDescription: "Nadawanie i rejestrowanie dostępu do danych.",
    description:
      "Wzory upoważnień, odwołań i ewidencji osób upoważnionych do przetwarzania danych.",
    priceNetCents: 16000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "DOCUMENT",
    includedFiles: ["DOCX", "XLSX", "PDF"],
    expectedDelivery: "Formularz danych po opłaceniu zamówienia. Generowanie dokumentu w Fazie 6.",
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
  },
  {
    name: "DPIA",
    slug: "dpia",
    shortDescription: "Ocena skutków dla ochrony danych.",
    description:
      "Struktura DPIA dla procesów wysokiego ryzyka: opis, konieczność, proporcjonalność, ryzyka i środki.",
    priceNetCents: 39000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "DOCUMENT",
    includedFiles: ["DOCX", "XLSX", "Instrukcja"],
    expectedDelivery: "Formularz danych po opłaceniu zamówienia. Generowanie dokumentu w Fazie 6.",
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
    metadata: { recommendedFor: ["dane wrażliwe", "monitoring", "medycyna"] },
  },
  {
    name: "Pakiet Mikro",
    slug: "pakiet-mikro",
    shortDescription: "Podstawowy zestaw dokumentów dla najmniejszych firm.",
    description:
      "Polityka prywatności, klauzule, podstawowa dokumentacja wewnętrzna i instrukcja wdrożenia.",
    priceNetCents: 49000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "PACKAGE",
    includedFiles: ["Polityka prywatności", "Klauzule", "Podstawowa instrukcja"],
    expectedDelivery: "Formularz pakietowy po opłaceniu zamówienia. Generowanie dokumentów w Fazie 6.",
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
  },
  {
    name: "Pakiet Standard",
    slug: "pakiet-standard",
    shortDescription: "Najczęstszy zestaw dokumentów RODO dla małej firmy.",
    description:
      "Dokumentacja wewnętrzna, rejestry, upoważnienia, procedury i polityka prywatności.",
    priceNetCents: 89000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "PACKAGE",
    includedFiles: ["Polityki", "Rejestry", "Procedury", "Upoważnienia"],
    expectedDelivery: "Formularz pakietowy po opłaceniu zamówienia. Generowanie dokumentów w Fazie 6.",
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
    metadata: { badge: "rekomendowany" },
  },
  {
    name: "Pakiet Pro",
    slug: "pakiet-pro",
    shortDescription: "Pakiet dla większej skali, danych wrażliwych i DPIA.",
    description:
      "Pełniejszy zestaw dokumentów z DPIA, procedurami naruszeń i rekomendacją dalszych działań.",
    priceNetCents: 149000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "PACKAGE",
    includedFiles: ["Pakiet Standard", "DPIA", "Procedura naruszeń", "Konsultacja startowa"],
    expectedDelivery: "Formularz pakietowy po opłaceniu zamówienia. Generowanie dokumentów w Fazie 6.",
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
    metadata: { recommendedFor: ["medycyna", "HR", "SaaS", "większa skala"] },
  },
];

export function productGrossCents(product: Pick<StarterProduct, "priceNetCents" | "vatRateBps">) {
  return calculateGrossFromNet(product.priceNetCents, product.vatRateBps);
}
