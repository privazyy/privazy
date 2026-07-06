import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const disclaimer =
  "Dokument ma charakter wzoru i wymaga uzupełnienia danymi organizacji. Nie stanowi indywidualnej porady prawnej ani gwarancji zgodności z RODO.";

const starterProducts = [
  ["Polityka prywatności RODO", "polityka-prywatnosci", "Polityka prywatności dla strony www, aplikacji lub sklepu.", 19000, "DOCUMENT", ["DOCX", "PDF", "HTML", "Instrukcja wdrożenia"], "PRIVACY_POLICY", "privacy_policy_rodo"],
  ["Polityka cookies", "polityka-cookies", "Zasady cookies, analityki i narzędzi marketingowych.", 12000, "DOCUMENT", ["DOCX", "PDF", "HTML"], "COOKIE_POLICY", "cookie_policy"],
  ["Polityka ochrony danych osobowych", "polityka-ochrony-danych-osobowych", "Wewnętrzna polityka ochrony danych dla organizacji.", 29000, "DOCUMENT", ["DOCX", "PDF", "Instrukcja wdrożenia"], "RODO_POLICY", "personal_data_protection_policy"],
  ["Rejestr czynności przetwarzania", "rejestr-czynnosci-przetwarzania", "RCP z procesami, podstawami, odbiorcami i retencją.", 24000, "DOCUMENT", ["XLSX", "DOCX", "Instrukcja"], "PROCESSING_REGISTER", "processing_register"],
  ["Procedura naruszeń ochrony danych", "procedura-naruszen-ochrony-danych", "Procedura reakcji na incydenty i termin 72 godzin.", 26000, "DOCUMENT", ["DOCX", "PDF", "Rejestr naruszeń"], "DATA_BREACH_PROCEDURE", "data_breach_procedure"],
  ["Procedura obsługi żądań osób", "procedura-obslugi-zadan-osob", "Dostęp, usunięcie, sprostowanie, sprzeciw i terminy.", 22000, "DOCUMENT", ["DOCX", "PDF", "Wzory odpowiedzi"], "DATA_SUBJECT_REQUEST_PROCEDURE", "data_subject_request_procedure"],
  ["Umowa powierzenia przetwarzania", "umowa-powierzenia-przetwarzania", "DPA dla dostawców, procesorów i podprocesorów.", 19000, "DOCUMENT", ["DOCX", "PDF"], "PROCESSING_AGREEMENT", "processing_agreement"],
  ["Upoważnienia i ewidencja upoważnień", "upowaznienia-i-ewidencja-upowaznien", "Nadawanie i rejestrowanie dostępu do danych.", 16000, "DOCUMENT", ["DOCX", "XLSX", "PDF"], "AUTHORIZATION_TEMPLATE", "authorization_register"],
  ["DPIA", "dpia", "Ocena skutków dla ochrony danych.", 39000, "DOCUMENT", ["DOCX", "XLSX", "Instrukcja"], "DPIA", "dpia"],
  ["Pakiet Mikro", "pakiet-mikro", "Podstawowy zestaw dokumentów dla najmniejszych firm.", 49000, "PACKAGE", ["Polityka prywatności", "Klauzule", "Podstawowa instrukcja"], null, "package_micro"],
  ["Pakiet Standard", "pakiet-standard", "Najczęstszy zestaw dokumentów RODO dla małej firmy.", 89000, "PACKAGE", ["Polityki", "Rejestry", "Procedury", "Upoważnienia"], null, "package_standard"],
  ["Pakiet Pro", "pakiet-pro", "Pakiet dla większej skali, danych wrażliwych i DPIA.", 149000, "PACKAGE", ["Pakiet Standard", "DPIA", "Procedura naruszeń", "Konsultacja startowa"], null, "package_pro"],
];

async function main() {
  for (const [name, slug, shortDescription, priceNetCents, productType, includedFiles, documentType, templateKey] of starterProducts) {
    await prisma.product.upsert({
      create: {
        name,
        slug,
        shortDescription,
        description: `${shortDescription} Po zakupie klient uzupełni formularz danych w Fazie 6.`,
        documentType,
        priceNetCents,
        vatRateBps: 2300,
        currency: "PLN",
        productType,
        includedFiles,
        expectedDelivery: productType === "PACKAGE" ? "Formularz pakietowy po opłaceniu zamówienia." : "Formularz danych po opłaceniu zamówienia.",
        legalDisclaimer: disclaimer,
        metadata: {
          seoDescription: shortDescription,
          seoTitle: `${name} - sklep PRIVAZY`,
        },
        status: "ACTIVE",
        templateKey,
      },
      update: {
        documentType,
        includedFiles,
        metadata: {
          seoDescription: shortDescription,
          seoTitle: `${name} - sklep PRIVAZY`,
        },
        priceNetCents,
        shortDescription,
        status: "ACTIVE",
        templateKey,
      },
      where: { slug },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
