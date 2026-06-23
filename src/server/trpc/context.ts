import { auth } from "@/server/auth";
import { getPrisma } from "@/server/db/prisma";

export async function createTRPCContext() {
  const session = await auth();

  return {
    session,
    prisma: getPrisma(),
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
