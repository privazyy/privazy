import "server-only";

import { Prisma, type NotificationChannel } from "@prisma/client";

import { getPrisma } from "@/server/db/prisma";

type PrismaClientOrTx = ReturnType<typeof getPrisma> | Prisma.TransactionClient;

export async function createNotification(input: {
  body?: string | null;
  channel?: NotificationChannel;
  entityId?: string | null;
  entityType?: string | null;
  metadata?: Prisma.InputJsonValue;
  organizationId?: string | null;
  title: string;
  tx?: PrismaClientOrTx;
  type: string;
  userId?: string | null;
}) {
  const prisma = input.tx ?? getPrisma();

  const existing = await prisma.notification.findFirst({
    where: {
      channel: input.channel ?? "CRM",
      entityId: input.entityId ?? null,
      entityType: input.entityType ?? null,
      organizationId: input.organizationId ?? null,
      type: input.type,
      userId: input.userId ?? null,
    },
  });

  if (existing) return existing;

  return prisma.notification.create({
    data: {
      body: input.body ?? null,
      channel: input.channel ?? "CRM",
      entityId: input.entityId ?? null,
      entityType: input.entityType ?? null,
      metadata: input.metadata ?? Prisma.JsonNull,
      organizationId: input.organizationId ?? null,
      title: input.title,
      type: input.type,
      userId: input.userId ?? null,
    },
  });
}

export async function createInternalNotification(input: Omit<Parameters<typeof createNotification>[0], "channel">) {
  return createNotification({ ...input, channel: "CRM" });
}

export async function createPortalNotification(input: Omit<Parameters<typeof createNotification>[0], "channel">) {
  return createNotification({ ...input, channel: "PORTAL" });
}
