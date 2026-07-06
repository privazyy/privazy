import { randomBytes } from "node:crypto";

import { MarketingEventType, NewsletterEventType } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { sendTransactionalEmail } from "@/server/email/transactional";
import { getPrisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const signupSchema = z.object({
  consent: z.literal(true),
  email: z.string().trim().email().max(240),
  source: z.string().trim().max(120).default("blog"),
  utmCampaign: z.string().trim().max(160).optional(),
  utmMedium: z.string().trim().max(160).optional(),
  utmSource: z.string().trim().max(160).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Podaj poprawny e-mail i zgode na kontakt marketingowy." }, { status: 400 });
  }

  const input = parsed.data;
  const consentText = "Zgadzam sie na otrzymywanie newslettera PRIVAZY z tresciami edukacyjnymi i marketingowymi.";
  const prisma = getPrisma();
  const token = randomBytes(24).toString("hex");

  const subscriber = await prisma.newsletterSubscriber.upsert({
    create: {
      consentAt: new Date(),
      consentText,
      email: input.email.toLowerCase(),
      source: input.source,
      status: "PENDING",
      unsubscribeToken: token,
      utmCampaign: input.utmCampaign,
      utmMedium: input.utmMedium,
      utmSource: input.utmSource,
    },
    update: {
      consentAt: new Date(),
      consentText,
      source: input.source,
      status: "PENDING",
      utmCampaign: input.utmCampaign,
      utmMedium: input.utmMedium,
      utmSource: input.utmSource,
    },
    where: { email: input.email.toLowerCase() },
  });

  await prisma.$transaction([
    prisma.newsletterEvent.create({
      data: {
        metadata: { source: input.source, utmCampaign: input.utmCampaign, utmMedium: input.utmMedium, utmSource: input.utmSource },
        subscriberId: subscriber.id,
        type: NewsletterEventType.SIGNUP,
      },
    }),
    prisma.marketingEvent.create({
      data: {
        metadata: { emailDomain: input.email.split("@")[1] ?? null },
        referrer: request.headers.get("referer"),
        source: input.source,
        type: MarketingEventType.NEWSLETTER_SIGNUP,
        utmCampaign: input.utmCampaign,
        utmMedium: input.utmMedium,
        utmSource: input.utmSource,
      },
    }),
  ]);

  await sendTransactionalEmail({
    html: `<p>Dziekujemy za zapis do newslettera PRIVAZY.</p><p>Link wypisu zostal przygotowany w systemie: ${subscriber.unsubscribeToken}</p>`,
    subject: "PRIVAZY: zapis do newslettera",
    to: subscriber.email,
  });

  return NextResponse.json({ ok: true });
}
