import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productCategories = [
  {
    name: "Dokumenty RODO",
    slug: "dokumenty-rodo",
    description: "Pojedyncze dokumenty i procedury do wdrożeń RODO.",
    sortOrder: 10,
  },
  {
    name: "Pakiety RODO",
    slug: "pakiety-rodo",
    description: "Zestawy dokumentów i usług dla firm o różnej skali.",
    sortOrder: 20,
  },
  {
    name: "Outsourcing IOD",
    slug: "outsourcing-iod",
    description: "Stałe wsparcie i obsługa funkcji inspektora ochrony danych.",
    sortOrder: 30,
  },
];

const products = [
  {
    categorySlug: "dokumenty-rodo",
    kind: "DOCUMENT",
    name: "Polityka prywatności",
    slug: "polityka-prywatnosci",
    shortName: "Polityka prywatności",
    description: "Personalizowana polityka prywatności dla strony internetowej lub sklepu.",
    fulfillmentDays: 2,
    variants: [
      {
        name: "Dokument DOCX + PDF",
        sku: "PVZ-DOC-PRIVACY-POLICY",
        priceCents: 49000,
        vatRateBps: 2300,
      },
    ],
  },
  {
    categorySlug: "pakiety-rodo",
    kind: "PACKAGE",
    name: "Pakiet RODO Standard",
    slug: "pakiet-rodo-standard",
    shortName: "RODO Standard",
    description: "Startowy pakiet dokumentacji RODO dla małych firm.",
    fulfillmentDays: 3,
    packageName: "Pakiet RODO Standard",
    variants: [
      {
        name: "Pakiet Standard",
        sku: "PVZ-PKG-RODO-STANDARD",
        priceCents: 149000,
        vatRateBps: 2300,
      },
    ],
  },
  {
    categorySlug: "outsourcing-iod",
    kind: "SERVICE",
    name: "Konsultacja IOD",
    slug: "konsultacja-iod",
    shortName: "Konsultacja IOD",
    description: "Jednorazowa konsultacja z ekspertem ochrony danych.",
    fulfillmentDays: 5,
    variants: [
      {
        name: "Konsultacja 60 minut",
        sku: "PVZ-SVC-IOD-CONSULT-60",
        priceCents: 79000,
        vatRateBps: 2300,
      },
    ],
  },
];

const blogCategories = [
  {
    name: "RODO w firmie",
    slug: "rodo-w-firmie",
    description: "Praktyczne wdrożenia, dokumentacja i procesy.",
    sortOrder: 10,
  },
  {
    name: "IOD",
    slug: "iod",
    description: "Inspektor ochrony danych, obowiązki i outsourcing.",
    sortOrder: 20,
  },
  {
    name: "Incydenty i żądania osób",
    slug: "incydenty-i-zadania-osob",
    description: "Naruszenia ochrony danych i obsługa praw osób.",
    sortOrder: 30,
  },
];

const pipelineStages = [
  { kind: "LEAD", key: "lead-new", name: "Nowy lead", sortOrder: 10, isDefault: true },
  { kind: "LEAD", key: "lead-qualified", name: "Zakwalifikowany", sortOrder: 20, isDefault: false },
  { kind: "LEAD", key: "lead-contacted", name: "Po kontakcie", sortOrder: 30, isDefault: false },
  { kind: "DEAL", key: "deal-open", name: "Otwarta szansa", sortOrder: 10, isDefault: true },
  { kind: "DEAL", key: "deal-proposal", name: "Oferta wysłana", sortOrder: 20, isDefault: false },
  { kind: "DEAL", key: "deal-won", name: "Wygrana", sortOrder: 90, isDefault: false },
  { kind: "ORDER", key: "order-fulfillment", name: "Realizacja", sortOrder: 10, isDefault: true },
  { kind: "ORDER", key: "order-completed", name: "Zakończone", sortOrder: 90, isDefault: false },
];

async function seedProductCategories() {
  const categories = new Map();

  for (const category of productCategories) {
    const saved = await prisma.productCategory.upsert({
      create: category,
      update: category,
      where: { slug: category.slug },
    });
    categories.set(category.slug, saved);
  }

  return categories;
}

async function seedProducts(categories) {
  const variantsBySku = new Map();

  for (const product of products) {
    const category = categories.get(product.categorySlug);
    const savedProduct = await prisma.product.upsert({
      create: {
        categoryId: category?.id,
        description: product.description,
        fulfillmentDays: product.fulfillmentDays,
        kind: product.kind,
        name: product.name,
        shortName: product.shortName,
        slug: product.slug,
        status: "ACTIVE",
      },
      update: {
        categoryId: category?.id,
        description: product.description,
        fulfillmentDays: product.fulfillmentDays,
        kind: product.kind,
        name: product.name,
        shortName: product.shortName,
        status: "ACTIVE",
      },
      where: { slug: product.slug },
    });

    for (const variant of product.variants) {
      const savedVariant = await prisma.productVariant.upsert({
        create: {
          currency: "PLN",
          name: variant.name,
          priceCents: variant.priceCents,
          productId: savedProduct.id,
          sku: variant.sku,
          status: "ACTIVE",
          vatRateBps: variant.vatRateBps,
        },
        update: {
          currency: "PLN",
          name: variant.name,
          priceCents: variant.priceCents,
          productId: savedProduct.id,
          status: "ACTIVE",
          vatRateBps: variant.vatRateBps,
        },
        where: { sku: variant.sku },
      });
      variantsBySku.set(variant.sku, savedVariant);
    }

    if (product.packageName) {
      await prisma.productPackage.upsert({
        create: {
          name: product.packageName,
          productId: savedProduct.id,
        },
        update: {
          name: product.packageName,
        },
        where: { productId: savedProduct.id },
      });
    }
  }

  const packageProduct = await prisma.product.findUnique({ where: { slug: "pakiet-rodo-standard" } });
  const documentVariant = variantsBySku.get("PVZ-DOC-PRIVACY-POLICY");

  if (packageProduct && documentVariant) {
    const productPackage = await prisma.productPackage.findUnique({ where: { productId: packageProduct.id } });

    if (productPackage) {
      await prisma.productPackageItem.upsert({
        create: {
          packageId: productPackage.id,
          productVariantId: documentVariant.id,
          quantity: 1,
          sortOrder: 10,
        },
        update: {
          quantity: 1,
          sortOrder: 10,
        },
        where: {
          packageId_productVariantId: {
            packageId: productPackage.id,
            productVariantId: documentVariant.id,
          },
        },
      });
    }
  }
}

async function seedBlogCategories() {
  for (const category of blogCategories) {
    await prisma.blogCategory.upsert({
      create: category,
      update: category,
      where: { slug: category.slug },
    });
  }
}

async function seedPipelineStages() {
  for (const stage of pipelineStages) {
    await prisma.pipelineStage.upsert({
      create: stage,
      update: stage,
      where: { key: stage.key },
    });
  }
}

async function main() {
  const categories = await seedProductCategories();
  await seedProducts(categories);
  await seedBlogCategories();
  await seedPipelineStages();
  console.log("Seeded product catalog, blog categories and default pipeline stages.");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
