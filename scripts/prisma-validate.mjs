import { spawnSync } from "node:child_process";
import { join } from "node:path";

const fallbackDatabaseUrl = "postgresql://privazy:privazy@localhost:5432/privazy?schema=public";
const prismaBin = join(process.cwd(), "node_modules", ".bin", process.platform === "win32" ? "prisma.cmd" : "prisma");
const command = process.platform === "win32" ? `"${prismaBin}" validate` : prismaBin;
const args = process.platform === "win32" ? [] : ["validate"];

const result = spawnSync(command, args, {
  env: {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL ?? fallbackDatabaseUrl,
    DIRECT_URL: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? fallbackDatabaseUrl,
  },
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.status ?? 1);
