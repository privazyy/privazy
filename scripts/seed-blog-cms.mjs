import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const legalDisclaimer =
  "Tresci maja charakter ogolny i nie stanowia indywidualnej porady prawnej. O obowiazkach decyduje analiza procesow w konkretnej organizacji.";

const categories = [
  ["RODO dla firm", "rodo-dla-firm", "Praktyczne wdrozenia RODO dla firm."],
  ["Inspektor Ochrony Danych", "inspektor-ochrony-danych", "Obowiazek IOD, outsourcing i organizacja roli."],
  ["Dokumentacja RODO", "dokumentacja-rodo", "Rejestry, polityki, umowy i procedury."],
  ["Naruszenia ochrony danych", "naruszenia-ochrony-danych", "Incydenty, ryzyko i termin 72h."],
  ["Zadania osob", "zadania-osob", "Obsluga praw osob, ktorych dane dotycza."],
  ["E-commerce", "e-commerce", "RODO w sprzedazy internetowej."],
  ["Placowki medyczne", "placowki-medyczne", "Dane zdrowotne i procesy medyczne."],
  ["Edukacja", "edukacja", "Ochrona danych w edukacji."],
  ["HR i rekrutacja", "hr-i-rekrutacja", "Dane kandydatow i pracownikow."],
  ["AI i dane osobowe", "ai-i-dane-osobowe", "AI governance i dane osobowe."],
];

const posts = [
  ["transfery-danych-do-usa-w-2026-checklista", "Transfery danych do USA w 2026: co sprawdzic przed wdrozeniem SaaS", "Praktyczna checklista dla firm korzystajacych z amerykanskich dostawcow chmury, CRM, analityki i narzedzi marketingowych.", "ai-i-dane-osobowe", "CHECK_IOD"],
  ["rejestr-czynnosci-przetwarzania-bez-bledow", "Rejestr czynnosci przetwarzania: jak prowadzic go bez bledow", "Praktyczny przewodnik po RCP: jakie kolumny sa obowiazkowe, jak opisac kategorie danych i kiedy aktualizowac wpisy.", "dokumentacja-rodo", "SHOP_PRODUCT"],
  ["czy-musisz-powolac-inspektora-ochrony-danych", "Czy musisz powolac Inspektora Ochrony Danych? 5 sygnalow", "Nie kazda firma ma obowiazek wyznaczyc IOD. Sprawdz przeslanki z art. 37 RODO i sytuacje wymagajace oceny.", "inspektor-ochrony-danych", "CHECK_IOD"],
  ["rodo-w-malej-firmie-minimum-do-wdrozenia", "RODO w malej firmie: minimum, ktore musisz wdrozyc", "Od polityki prywatnosci po upowaznienia. Lista dokumentow i decyzji dla mikroprzedsiebiorcy.", "rodo-dla-firm", "SHOP_PRODUCT"],
  ["kary-uodo-w-2025-wnioski-dla-firm", "Kary UODO w 2025 roku: czego nauczyly nas decyzje", "Jak czytac decyzje organu i przekladac je na dzialania w firmie.", "rodo-dla-firm", "CONSULTATION"],
  ["umowa-powierzenia-danych-kiedy-potrzebna", "Umowa powierzenia danych: kiedy jest naprawde potrzebna", "Hosting, ksiegowosc, newsletter i support. Sprawdz, z ktorymi dostawcami potrzebujesz DPA.", "dokumentacja-rodo", "SHOP_PRODUCT"],
  ["zgody-marketingowe-a-rodo", "Zgody marketingowe a RODO: jak zbierac je zgodnie z prawem", "Checkbox, tresc zgody, dowod jej udzielenia i mozliwosc wycofania.", "e-commerce", "NEWSLETTER"],
  ["iod-w-grupie-kapitalowej", "IOD w grupie kapitalowej: jeden inspektor dla wielu spolek", "Kiedy jeden Inspektor moze obsluzyc cala grupe i jak zapewnic mu realna dostepnosc.", "inspektor-ochrony-danych", "SERVICE_CONTACT"],
  ["analiza-ryzyka-i-dpia-krok-po-kroku", "Analiza ryzyka i DPIA: krok po kroku dla zespolu", "Kiedy ocena skutkow jest obowiazkowa, jak ja przeprowadzic i udokumentowac.", "dokumentacja-rodo", "SHOP_PRODUCT"],
  ["ai-act-a-rodo-obowiazki-firm", "AI Act a RODO: gdzie przecinaja sie obowiazki firm", "Nowe narzedzia AI nie zastepuja obowiazkow RODO. Sprawdz ryzyka, transparentnosc i bezpieczenstwo danych.", "ai-i-dane-osobowe", "CONSULTATION"],
];

async function main() {
  const systemUser = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    where: { role: { in: ["ADMIN", "LAWYER"] } },
  });

  for (const [name, slug, description] of categories) {
    await prisma.blogCategory.upsert({
      create: {
        description,
        metaDescription: description,
        name,
        slug,
      },
      update: { description, metaDescription: description, name },
      where: { slug },
    });
  }

  for (const [slug, title, excerpt, categorySlug, ctaType] of posts) {
    const category = await prisma.blogCategory.findUniqueOrThrow({ where: { slug: categorySlug } });
    const content = `## Najwazniejsze\n${excerpt}\n\n## Co sprawdzic\nOpisz proces, role stron, kategorie danych, ryzyka i dokumenty, ktore potwierdzaja decyzje.\n\n## Kolejny krok\nUzyj tego artykulu jako punktu startowego i przeprowadz review prawny przed publikacja zmian.`;

    const post = await prisma.blogPost.upsert({
      create: {
        authorId: systemUser?.id,
        categoryId: category.id,
        content,
        ctaType,
        excerpt,
        legalDisclaimer,
        metaDescription: excerpt.slice(0, 180),
        publishedAt: new Date("2026-06-21T10:00:00.000Z"),
        readingTime: 5,
        reviewerId: systemUser?.id,
        slug,
        source: "static-blog-migration",
        status: "PUBLISHED",
        title,
      },
      update: {
        categoryId: category.id,
        ctaType,
        excerpt,
        legalDisclaimer,
        metaDescription: excerpt.slice(0, 180),
        source: "static-blog-migration",
      },
      where: { slug },
    });

    const tag = await prisma.blogTag.upsert({
      create: { name: category.name, slug: category.slug },
      update: { name: category.name },
      where: { slug: category.slug },
    });

    await prisma.blogPostTag.upsert({
      create: { postId: post.id, tagId: tag.id },
      update: {},
      where: { postId_tagId: { postId: post.id, tagId: tag.id } },
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
