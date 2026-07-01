import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productCategories = [
  {
    slug: "dokumenty-rodo",
    name: "Dokumenty RODO",
    description: "Gotowe generatory i pakiety dokumentacji ochrony danych.",
    sortOrder: 10,
  },
  {
    slug: "outsourcing-iod",
    name: "Outsourcing IOD",
    description: "Pakiety opieki i wsparcia dla organizacji wymagajacych IOD.",
    sortOrder: 20,
  },
];

const blogCategories = [
  {
    slug: "rodo-w-praktyce",
    name: "RODO w praktyce",
    description: "Praktyczne poradniki dla administratorow danych.",
    sortOrder: 10,
  },
  {
    slug: "naruszenia-i-dsar",
    name: "Naruszenia i DSAR",
    description: "Obsluga incydentow, zadan osob i terminow compliance.",
    sortOrder: 20,
  },
];

const pipelineStages = [
  { code: "new", name: "Nowy lead", sortOrder: 10, probability: 10 },
  { code: "qualified", name: "Zakwalifikowany", sortOrder: 20, probability: 35 },
  { code: "proposal", name: "Oferta wyslana", sortOrder: 30, probability: 60 },
  { code: "won", name: "Wygrany", sortOrder: 40, probability: 100, isWon: true },
  { code: "lost", name: "Utracony", sortOrder: 50, probability: 0, isLost: true },
];

async function seedProductCatalog() {
  const documentsCategory = await prisma.productCategory.upsert({
    where: { slug: "dokumenty-rodo" },
    update: productCategories[0],
    create: productCategories[0],
  });

  await prisma.productCategory.upsert({
    where: { slug: "outsourcing-iod" },
    update: productCategories[1],
    create: productCategories[1],
  });

  const privacyPolicy = await prisma.product.upsert({
    where: { slug: "polityka-prywatnosci" },
    update: {
      categoryId: documentsCategory.id,
      name: "Polityka prywatnosci",
      status: "ACTIVE",
      shortDescription: "Generator polityki prywatnosci dla strony internetowej.",
      sortOrder: 10,
    },
    create: {
      categoryId: documentsCategory.id,
      name: "Polityka prywatnosci",
      slug: "polityka-prywatnosci",
      status: "ACTIVE",
      shortDescription: "Generator polityki prywatnosci dla strony internetowej.",
      sortOrder: 10,
    },
  });

  const privacyPolicyVariant = await prisma.productVariant.upsert({
    where: { sku: "PRIVACY-POLICY-STANDARD" },
    update: {
      productId: privacyPolicy.id,
      name: "Standard",
      status: "ACTIVE",
      currency: "PLN",
      netAmountCents: 39000,
      grossAmountCents: 47970,
      vatRateBps: 2300,
      vatAmountCents: 8970,
      fulfillmentDays: 1,
    },
    create: {
      productId: privacyPolicy.id,
      name: "Standard",
      sku: "PRIVACY-POLICY-STANDARD",
      status: "ACTIVE",
      currency: "PLN",
      netAmountCents: 39000,
      grossAmountCents: 47970,
      vatRateBps: 2300,
      vatAmountCents: 8970,
      fulfillmentDays: 1,
    },
  });

  const starterPackage = await prisma.productPackage.upsert({
    where: { slug: "pakiet-start-rodo" },
    update: {
      name: "Pakiet start RODO",
      status: "ACTIVE",
      description: "Startowy pakiet dokumentow dla malej organizacji.",
      currency: "PLN",
      netAmountCents: 99000,
      grossAmountCents: 121770,
      vatRateBps: 2300,
      vatAmountCents: 22770,
    },
    create: {
      name: "Pakiet start RODO",
      slug: "pakiet-start-rodo",
      status: "ACTIVE",
      description: "Startowy pakiet dokumentow dla malej organizacji.",
      currency: "PLN",
      netAmountCents: 99000,
      grossAmountCents: 121770,
      vatRateBps: 2300,
      vatAmountCents: 22770,
    },
  });

  await prisma.productPackageItem.upsert({
    where: {
      packageId_productId_productVariantId: {
        packageId: starterPackage.id,
        productId: privacyPolicy.id,
        productVariantId: privacyPolicyVariant.id,
      },
    },
    update: {
      quantity: 1,
      sortOrder: 10,
    },
    create: {
      packageId: starterPackage.id,
      productId: privacyPolicy.id,
      productVariantId: privacyPolicyVariant.id,
      quantity: 1,
      sortOrder: 10,
    },
  });
}

async function seedBlogCategories() {
  for (const category of blogCategories) {
    await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
}

async function seedPipelineStages() {
  for (const stage of pipelineStages) {
    await prisma.pipelineStage.upsert({
      where: { code: stage.code },
      update: stage,
      create: stage,
    });
  }
}

async function main() {
  await seedProductCatalog();
  await seedBlogCategories();
  await seedPipelineStages();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
