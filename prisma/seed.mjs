import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function readSeedAdminEnv() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME;
  const missing = [];

  if (!email || email === "replace_in_private_env") missing.push("SEED_ADMIN_EMAIL");
  if (!password || password === "replace_in_private_env") missing.push("SEED_ADMIN_PASSWORD");
  if (!name || name === "replace_in_private_env") missing.push("SEED_ADMIN_NAME");

  if (missing.length > 0) {
    return { missing };
  }

  return { email, name, password };
}

async function main() {
  const seed = readSeedAdminEnv();

  if ("missing" in seed) {
    console.log(`Skipping admin seed. Set ${seed.missing.join(", ")} in a private env file to create an admin user.`);
    return;
  }

  const passwordHash = await hash(seed.password, 12);

  await prisma.user.upsert({
    create: {
      email: seed.email.toLowerCase(),
      name: seed.name,
      passwordHash,
      role: "ADMIN",
    },
    update: {
      name: seed.name,
      passwordHash,
      role: "ADMIN",
    },
    where: {
      email: seed.email.toLowerCase(),
    },
  });

  console.log(`Seeded admin user ${seed.email.toLowerCase()} from private environment variables.`);
}

main()
  .catch((error) => {
    console.error("Admin seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
