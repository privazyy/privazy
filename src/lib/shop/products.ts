import { calculateGrossFromNet } from "@/lib/shop/money";

export type StarterProduct = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  priceNetCents: number;
  vatRateBps: number;
  currency: "PLN";
  productType: "DOCUMENT" | "PACKAGE" | "SERVICE";
  includedFiles: string[];
  expectedDelivery: string;
  legalDisclaimer: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  documentType?:
    | "AUTHORIZATION_TEMPLATE"
    | "COOKIE_POLICY"
    | "DATA_BREACH_PROCEDURE"
    | "DATA_SUBJECT_REQUEST_PROCEDURE"
    | "DPIA"
    | "PRIVACY_POLICY"
    | "PROCESSING_AGREEMENT"
    | "PROCESSING_REGISTER"
    | "RODO_POLICY";
  metadata?: {
    badge?: string;
    recommendedFor?: string[];
    routeHint?: string;
    seoDescription?: string;
    seoTitle?: string;
  };
};

const disclaimer =
  "Dokument ma charakter wzoru i wymaga uzupełnienia danymi organizacji. Nie stanowi indywidualnej porady prawnej ani gwarancji zgodności z RODO.";
const documentDelivery =
  "Planowany przyszły formularz danych; niedostępny w tym sandboxie.";
const packageDelivery =
  "Planowany przyszły formularz pakietowy; niedostępny w tym sandboxie.";

export const starterProducts: StarterProduct[] = [
  {
    name: "Polityka prywatności RODO",
    slug: "polityka-prywatnosci",
    shortDescription: "Polityka prywatności dla strony www, aplikacji lub sklepu.",
    description:
      "Planowany dokument obejmuje administratora, cele, podstawy prawne, odbiorców, retencję, prawa osób, cookies i transfery. Ten sandbox nie uruchamia formularza ani generatora.",
    priceNetCents: 19000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "DOCUMENT",
    includedFiles: ["DOCX", "PDF", "HTML", "Instrukcja wdrożenia"],
    expectedDelivery: documentDelivery,
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
    documentType: "PRIVACY_POLICY",
    metadata: {
      badge: "najczęściej wybierany",
      recommendedFor: ["strona www", "e-commerce", "SaaS"],
      seoDescription: "Polityka prywatności RODO w jawnym checkoutcie mock/sandbox.",
      seoTitle: "Polityka prywatności RODO - sklep PRIVAZY",
    },
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
    expectedDelivery: documentDelivery,
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
    documentType: "COOKIE_POLICY",
    metadata: { recommendedFor: ["strona www", "marketing"], seoTitle: "Polityka cookies - sklep PRIVAZY" },
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
    expectedDelivery: documentDelivery,
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
    documentType: "PROCESSING_REGISTER",
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
    expectedDelivery: documentDelivery,
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
    documentType: "DATA_BREACH_PROCEDURE",
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
    expectedDelivery: documentDelivery,
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
    documentType: "DATA_SUBJECT_REQUEST_PROCEDURE",
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
    expectedDelivery: documentDelivery,
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
    documentType: "PROCESSING_AGREEMENT",
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
    expectedDelivery: documentDelivery,
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
    documentType: "DPIA",
    metadata: { recommendedFor: ["dane wrażliwe", "monitoring", "medycyna"] },
  },
  {
    name: "Pakiet Start",
    slug: "pakiet-start",
    shortDescription: "Podstawowy zestaw dokumentów dla małych firm.",
    description:
      "Polityka prywatności, klauzule, podstawowa dokumentacja wewnętrzna i instrukcja wdrożenia.",
    priceNetCents: 49000,
    vatRateBps: 2300,
    currency: "PLN",
    productType: "PACKAGE",
    includedFiles: ["Polityka prywatności", "Klauzule", "Podstawowa instrukcja"],
    expectedDelivery: packageDelivery,
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
    expectedDelivery: packageDelivery,
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
    expectedDelivery: packageDelivery,
    legalDisclaimer: disclaimer,
    status: "ACTIVE",
    metadata: { recommendedFor: ["medycyna", "HR", "SaaS", "większa skala"] },
  },
];

export function productGrossCents(product: Pick<StarterProduct, "priceNetCents" | "vatRateBps">) {
  return calculateGrossFromNet(product.priceNetCents, product.vatRateBps);
}
