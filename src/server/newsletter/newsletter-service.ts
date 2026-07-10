import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { Prisma, type NewsletterConsentEventType } from "@prisma/client";
import type { z } from "zod";

import type { CmsActor } from "@/server/cms/cms-permissions";
import type {
  newsletterResubscribeSchema,
  newsletterSubscriberListQuerySchema,
  newsletterSubscribeSchema,
  newsletterUnsubscribeSchema,
} from "@/server/newsletter/schemas";
import { neutralNewsletterResponse, serializeSubscriberForAdmin } from "@/server/newsletter/serializers";
import { getPrisma } from "@/server/db/prisma";

type SubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
type UnsubscribeInput = z.infer<typeof newsletterUnsubscribeSchema>;
type ResubscribeInput = z.infer<typeof newsletterResubscribeSchema>;
type SubscriberListInput = z.infer<typeof newsletterSubscriberListQuerySchema>;

export class NewsletterServiceError extends Error {
  constructor(
    public readonly status: 400 | 404 | 409,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "NewsletterServiceError";
  }
}

export async function subscribeNewsletter(input: SubscribeInput, requestMeta?: RequestMeta) {
  if (input.website) return neutralNewsletterResponse();

  const prisma = getPrisma();
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: input.email } });
  if (existing) {
    if (existing.status === "UNSUBSCRIBED") {
      await resubscribeNewsletter(
        {
          email: input.email,
          source: input.source,
          consentMarketing: true,
          consentTextSnapshot: input.consentTextSnapshot,
        },
        requestMeta,
      );
    }
    return neutralNewsletterResponse();
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSecret(token);

  await prisma.$transaction(async (tx) => {
    const subscriber = await tx.newsletterSubscriber.create({
      data: {
        email: input.email,
        status: "ACTIVE",
        source: input.source,
        consentMarketing: true,
        consentTextSnapshot: input.consentTextSnapshot,
        confirmedAt: new Date(),
        unsubscribeTokenHash: tokenHash,
      },
    });
    await recordNewsletterConsentEventTx(tx, subscriber.id, "SUBSCRIBED", input.source, input.consentTextSnapshot, requestMeta);
    await writeNewsletterAudit(tx, "newsletter.subscribed", subscriber.id, {
      source: input.source,
      consentMarketing: true,
    });
  });

  return neutralNewsletterResponse();
}

export async function unsubscribeNewsletter(input: UnsubscribeInput, requestMeta?: RequestMeta) {
  const tokenHash = hashSecret(input.token);
  const prisma = getPrisma();
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { unsubscribeTokenHash: tokenHash } });

  if (!subscriber) return neutralNewsletterResponse();

  await prisma.$transaction(async (tx) => {
    const updated = await tx.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: "UNSUBSCRIBED",
        consentMarketing: false,
        unsubscribedAt: new Date(),
      },
    });
    await recordNewsletterConsentEventTx(
      tx,
      updated.id,
      "UNSUBSCRIBED",
      "unsubscribe",
      updated.consentTextSnapshot,
      requestMeta,
    );
    await writeNewsletterAudit(tx, "newsletter.unsubscribed", updated.id, { source: "unsubscribe" });
  });

  return neutralNewsletterResponse();
}

export async function resubscribeNewsletter(input: ResubscribeInput, requestMeta?: RequestMeta) {
  const prisma = getPrisma();
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { email: input.email } });
  if (!subscriber) return subscribeNewsletter({ ...input, website: "" }, requestMeta);

  await prisma.$transaction(async (tx) => {
    const updated = await tx.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: "ACTIVE",
        consentMarketing: true,
        consentTextSnapshot: input.consentTextSnapshot,
        confirmedAt: subscriber.confirmedAt ?? new Date(),
        unsubscribedAt: null,
        source: input.source,
      },
    });
    await recordNewsletterConsentEventTx(tx, updated.id, "RESUBSCRIBED", input.source, input.consentTextSnapshot, requestMeta);
    await writeNewsletterAudit(tx, "newsletter.resubscribed", updated.id, { source: input.source });
  });

  return neutralNewsletterResponse();
}

export async function listSubscribersForAdmin(input: SubscriberListInput) {
  const rows = await getPrisma().newsletterSubscriber.findMany({
    where: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.q ? { email: { contains: input.q, mode: "insensitive" } } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;

  return {
    items: items.map(serializeSubscriberForAdmin),
    nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
  };
}

export async function recordNewsletterConsentEvent(
  subscriberId: string,
  type: NewsletterConsentEventType,
  source: string,
  consentTextSnapshot: string,
  requestMeta?: RequestMeta,
) {
  await recordNewsletterConsentEventTx(
    getPrisma(),
    subscriberId,
    type,
    source,
    consentTextSnapshot,
    requestMeta,
  );
}

export function getRequestMeta(request: Request): RequestMeta {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const userAgent = request.headers.get("user-agent")?.trim();

  return {
    ipHash: forwardedFor || realIp ? hashSecret(forwardedFor || realIp || "") : undefined,
    userAgentHash: userAgent ? hashSecret(userAgent) : undefined,
  };
}

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function recordNewsletterConsentEventTx(
  tx: Prisma.TransactionClient | ReturnType<typeof getPrisma>,
  subscriberId: string,
  type: NewsletterConsentEventType,
  source: string,
  consentTextSnapshot: string,
  requestMeta?: RequestMeta,
) {
  await tx.newsletterConsentEvent.create({
    data: {
      subscriberId,
      type,
      source,
      consentTextSnapshot,
      ipHash: requestMeta?.ipHash,
      userAgentHash: requestMeta?.userAgentHash,
    },
  });
}

async function writeNewsletterAudit(
  tx: Prisma.TransactionClient,
  action: string,
  entityId: string,
  metadata: Record<string, unknown>,
  actor?: CmsActor,
) {
  await tx.auditLog.create({
    data: {
      userId: actor?.id,
      action,
      entityType: "NewsletterSubscriber",
      entityId,
      metadata: toJson(metadata),
    },
  });
}

function toJson(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}

type RequestMeta = {
  ipHash?: string;
  userAgentHash?: string;
};
