import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productCategories = [
  {
    slug: "dokumenty-rodo",
    name: "Dokumenty RODO",
    description: "Starter catalog category for generated GDPR documents.",
    sortOrder: 10,
  },
  {
    slug: "uslugi-iod",
    name: "Uslugi IOD",
    description: "Starter catalog category for DPO support services.",
    sortOrder: 20,
  },
];

const blogCategories = [
  {
    slug: "rodo-w-praktyce",
    name: "RODO w praktyce",
    description: "Practical articles about data protection operations.",
    sortOrder: 10,
  },
  {
    slug: "naruszenia-i-zadania-osob",
    name: "Naruszenia i zadania osob",
    description: "Incident and data-subject-request guidance.",
    sortOrder: 20,
  },
];

const pipelineStages = [
  { code: "new", name: "Nowy lead", sortOrder: 10, probability: 10 },
  { code: "contacted", name: "Po kontakcie", sortOrder: 20, probability: 25 },
  { code: "qualified", name: "Zakwalifikowany", sortOrder: 30, probability: 45 },
  { code: "proposal", name: "Oferta", sortOrder: 40, probability: 70 },
  { code: "won", name: "Wygrany", sortOrder: 50, probability: 100, isWon: true },
  { code: "lost", name: "Utracony", sortOrder: 60, probability: 0, isLost: true },
];

async function seedProductCatalog() {
  const documentsCategory = await prisma.productCategory.upsert({
    where: { slug: "dokumenty-rodo" },
    update: productCategories[0],
    create: productCategories[0],
  });

  await prisma.productCategory.upsert({
    where: { slug: "uslugi-iod" },
    update: productCategories[1],
    create: productCategories[1],
  });

  const privacyPolicy = await prisma.product.upsert({
    where: { slug: "polityka-prywatnosci" },
    update: {
      categoryId: documentsCategory.id,
      documentType: "PRIVACY_POLICY",
      name: "Polityka prywatnosci",
      status: "ACTIVE",
      type: "DOCUMENT",
      shortDescription: "Starter product for a privacy policy document.",
      sortOrder: 10,
    },
    create: {
      categoryId: documentsCategory.id,
      documentType: "PRIVACY_POLICY",
      name: "Polityka prywatnosci",
      slug: "polityka-prywatnosci",
      status: "ACTIVE",
      type: "DOCUMENT",
      shortDescription: "Starter product for a privacy policy document.",
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
      netAmountCents: 19000,
      grossAmountCents: 23370,
      vatRateBps: 2300,
      vatAmountCents: 4370,
      fulfillmentDays: 1,
    },
    create: {
      productId: privacyPolicy.id,
      name: "Standard",
      sku: "PRIVACY-POLICY-STANDARD",
      status: "ACTIVE",
      currency: "PLN",
      netAmountCents: 19000,
      grossAmountCents: 23370,
      vatRateBps: 2300,
      vatAmountCents: 4370,
      fulfillmentDays: 1,
    },
  });

  const starterPackage = await prisma.productPackage.upsert({
    where: { slug: "pakiet-start-rodo" },
    update: {
      name: "Pakiet start RODO",
      status: "ACTIVE",
      description: "Starter package for a small organization.",
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
      description: "Starter package for a small organization.",
      currency: "PLN",
      netAmountCents: 99000,
      grossAmountCents: 121770,
      vatRateBps: 2300,
      vatAmountCents: 22770,
    },
  });

  await prisma.productPackageItem.upsert({
    where: {
      packageId_productVariantId: {
        packageId: starterPackage.id,
        productVariantId: privacyPolicyVariant.id,
      },
    },
    update: {
      productId: privacyPolicy.id,
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
