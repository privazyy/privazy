import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const disclaimer =
  "Dokument ma charakter wzoru i wymaga uzupełnienia danymi organizacji. Nie stanowi indywidualnej porady prawnej ani gwarancji zgodności z RODO.";

const starterProducts = [
  ["Polityka prywatności RODO", "polityka-prywatnosci", "Polityka prywatności dla strony www, aplikacji lub sklepu.", 19000, "DOCUMENT", ["DOCX", "PDF", "HTML", "Instrukcja wdrożenia"]],
  ["Polityka cookies", "polityka-cookies", "Zasady cookies, analityki i narzędzi marketingowych.", 12000, "DOCUMENT", ["DOCX", "PDF", "HTML"]],
  ["Polityka ochrony danych osobowych", "polityka-ochrony-danych-osobowych", "Wewnętrzna polityka ochrony danych dla organizacji.", 29000, "DOCUMENT", ["DOCX", "PDF", "Instrukcja wdrożenia"]],
  ["Rejestr czynności przetwarzania", "rejestr-czynnosci-przetwarzania", "RCP z procesami, podstawami, odbiorcami i retencją.", 24000, "DOCUMENT", ["XLSX", "DOCX", "Instrukcja"]],
  ["Procedura naruszeń ochrony danych", "procedura-naruszen-ochrony-danych", "Procedura reakcji na incydenty i termin 72 godzin.", 26000, "DOCUMENT", ["DOCX", "PDF", "Rejestr naruszeń"]],
  ["Procedura obsługi żądań osób", "procedura-obslugi-zadan-osob", "Dostęp, usunięcie, sprostowanie, sprzeciw i terminy.", 22000, "DOCUMENT", ["DOCX", "PDF", "Wzory odpowiedzi"]],
  ["Umowa powierzenia przetwarzania", "umowa-powierzenia-przetwarzania", "DPA dla dostawców, procesorów i podprocesorów.", 19000, "DOCUMENT", ["DOCX", "PDF"]],
  ["Upoważnienia i ewidencja upoważnień", "upowaznienia-i-ewidencja-upowaznien", "Nadawanie i rejestrowanie dostępu do danych.", 16000, "DOCUMENT", ["DOCX", "XLSX", "PDF"]],
  ["DPIA", "dpia", "Ocena skutków dla ochrony danych.", 39000, "DOCUMENT", ["DOCX", "XLSX", "Instrukcja"]],
  ["Pakiet Mikro", "pakiet-mikro", "Podstawowy zestaw dokumentów dla najmniejszych firm.", 49000, "PACKAGE", ["Polityka prywatności", "Klauzule", "Podstawowa instrukcja"]],
  ["Pakiet Standard", "pakiet-standard", "Najczęstszy zestaw dokumentów RODO dla małej firmy.", 89000, "PACKAGE", ["Polityki", "Rejestry", "Procedury", "Upoważnienia"]],
  ["Pakiet Pro", "pakiet-pro", "Pakiet dla większej skali, danych wrażliwych i DPIA.", 149000, "PACKAGE", ["Pakiet Standard", "DPIA", "Procedura naruszeń", "Konsultacja startowa"]],
];

async function main() {
  for (const [name, slug, shortDescription, priceNetCents, productType, includedFiles] of starterProducts) {
    await prisma.product.upsert({
      create: {
        name,
        slug,
        shortDescription,
        description: `${shortDescription} Po zakupie klient uzupełni formularz danych w Fazie 6.`,
        priceNetCents,
        vatRateBps: 2300,
        currency: "PLN",
        productType,
        includedFiles,
        expectedDelivery: productType === "PACKAGE" ? "Formularz pakietowy po opłaceniu zamówienia." : "Formularz danych po opłaceniu zamówienia.",
        legalDisclaimer: disclaimer,
        status: "ACTIVE",
      },
      update: {
        includedFiles,
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
