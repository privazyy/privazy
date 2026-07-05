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

  const email = seed.email.toLowerCase();
  const existing = await prisma.user.findUnique({
    select: { id: true },
    where: { email },
  });

  const user = existing
    ? await prisma.user.update({
        data: {
          name: seed.name,
          passwordHash,
          role: "ADMIN",
        },
        where: { email },
      })
    : await prisma.user.create({
        data: {
          email,
          name: seed.name,
          passwordHash,
          role: "ADMIN",
        },
      });

  await prisma.auditLog.create({
    data: {
      action: existing ? "seed.admin_updated" : "seed.admin_created",
      entityId: user.id,
      entityType: "User",
      metadata: {
        email: seed.email.toLowerCase(),
        role: "ADMIN",
      },
      userId: user.id,
    },
  });

  console.log(`Seeded admin user ${email} from private environment variables.`);
}

main()
  .catch((error) => {
    console.error("Admin seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
