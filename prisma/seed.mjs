import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const disclaimer =
  "Dokument ma charakter wzoru i wymaga uzupełnienia danymi organizacji. Nie stanowi indywidualnej porady prawnej ani gwarancji zgodności z RODO.";

const starterProducts = [
  ["Polityka prywatności RODO", "polityka-prywatnosci", "Polityka prywatności dla strony www, aplikacji lub sklepu.", 19000, "DOCUMENT", ["DOCX", "PDF", "HTML", "Instrukcja wdrożenia"], "PRIVACY_POLICY"],
  ["Polityka cookies", "polityka-cookies", "Zasady cookies, analityki i narzędzi marketingowych.", 12000, "DOCUMENT", ["DOCX", "PDF", "HTML"], "COOKIE_POLICY"],
  ["Rejestr czynności przetwarzania", "rejestr-czynnosci-przetwarzania", "RCP z procesami, podstawami, odbiorcami i retencją.", 24000, "DOCUMENT", ["XLSX", "DOCX", "Instrukcja"], "PROCESSING_REGISTER"],
  ["Procedura naruszeń ochrony danych", "procedura-naruszen-ochrony-danych", "Procedura reakcji na incydenty i termin 72 godzin.", 26000, "DOCUMENT", ["DOCX", "PDF", "Rejestr naruszeń"], "DATA_BREACH_PROCEDURE"],
  ["Procedura obsługi żądań osób", "procedura-obslugi-zadan-osob", "Dostęp, usunięcie, sprostowanie, sprzeciw i terminy.", 22000, "DOCUMENT", ["DOCX", "PDF", "Wzory odpowiedzi"], "DATA_SUBJECT_REQUEST_PROCEDURE"],
  ["Umowa powierzenia przetwarzania", "umowa-powierzenia-przetwarzania", "DPA dla dostawców, procesorów i podprocesorów.", 19000, "DOCUMENT", ["DOCX", "PDF"], "PROCESSING_AGREEMENT"],
  ["DPIA", "dpia", "Ocena skutków dla ochrony danych.", 39000, "DOCUMENT", ["DOCX", "XLSX", "Instrukcja"], "DPIA"],
  ["Pakiet Start", "pakiet-start", "Podstawowy zestaw dokumentów dla małych firm.", 49000, "PACKAGE", ["Polityka prywatności", "Klauzule", "Podstawowa instrukcja"], null],
  ["Pakiet Standard", "pakiet-standard", "Najczęstszy zestaw dokumentów RODO dla małej firmy.", 89000, "PACKAGE", ["Polityki", "Rejestry", "Procedury", "Upoważnienia"], null],
  ["Pakiet Pro", "pakiet-pro", "Pakiet dla większej skali, danych wrażliwych i DPIA.", 149000, "PACKAGE", ["Pakiet Standard", "DPIA", "Procedura naruszeń", "Konsultacja startowa"], null],
];

async function main() {
  for (const [name, slug, shortDescription, priceNetCents, productType, includedFiles, documentType] of starterProducts) {
    const documentTemplate = documentType
      ? await prisma.documentTemplate.findFirst({
          orderBy: { version: "desc" },
          where: { status: "ACTIVE", type: documentType },
        })
      : null;

    await prisma.product.upsert({
      create: {
        name,
        slug,
        shortDescription,
        description: `${shortDescription} Sandbox nie dostarcza jeszcze formularza ani wygenerowanego dokumentu.`,
        documentType,
        priceNetCents,
        vatRateBps: 2300,
        currency: "PLN",
        productType,
        includedFiles,
        expectedDelivery:
          productType === "PACKAGE"
            ? "Planowany przyszły formularz pakietowy; niedostępny w tym sandboxie."
            : "Planowany przyszły formularz danych; niedostępny w tym sandboxie.",
        legalDisclaimer: disclaimer,
        documentTemplateId: documentTemplate?.id,
        metadata: {
          commerceMode: "SANDBOX",
          seoDescription: shortDescription,
          seoTitle: `${name} - sandbox sklepu PRIVAZY`,
        },
        status: "ACTIVE",
      },
      update: {
        documentTemplateId: documentTemplate?.id,
        documentType,
        includedFiles,
        metadata: {
          commerceMode: "SANDBOX",
          seoDescription: shortDescription,
          seoTitle: `${name} - sandbox sklepu PRIVAZY`,
        },
        priceNetCents,
        shortDescription,
        status: "ACTIVE",
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
