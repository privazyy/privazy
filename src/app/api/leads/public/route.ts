import { NextResponse } from "next/server";

import { getRequestIp, safeLogAuditEvent } from "@/server/audit/log";
import { createPublicLead, publicLeadPayloadSchema } from "@/server/leads/public";
import { checkRateLimit, cleanupRateLimitBuckets } from "@/server/security/rate-limit";
import { verifyTurnstileToken } from "@/server/security/turnstile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const IP_RATE_LIMIT = { limit: 12, windowMs: 10 * 60 * 1000 };
const EMAIL_RATE_LIMIT = { limit: 4, windowMs: 60 * 60 * 1000 };

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowy format danych." }, { status: 400 });
  }

  const parsed = publicLeadPayloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Uzupełnij wymagane dane formularza." }, { status: 400 });
  }

  const clientIp = getRequestIp(request);
  const email = parsed.data.contact.email.toLowerCase();

  if (parsed.data.security?.website) {
    await safeLogAuditEvent({
      action: "lead.honeypot_blocked",
      entityId: email,
      entityType: "LeadForm",
      metadata: { formType: "public_site_lead" },
      request,
    });

    return NextResponse.json({ ok: true }, { status: 202 });
  }

  cleanupRateLimitBuckets();

  const ipLimit = checkRateLimit(`lead:public:ip:${clientIp ?? "unknown"}`, IP_RATE_LIMIT);
  const emailLimit = checkRateLimit(`lead:public:email:${email}`, EMAIL_RATE_LIMIT);

  if (!ipLimit.allowed || !emailLimit.allowed) {
    await safeLogAuditEvent({
      action: "lead.rate_limit_blocked",
      entityId: email,
      entityType: "LeadForm",
      metadata: {
        emailResetAt: emailLimit.resetAt,
        formType: "public_site_lead",
        ipResetAt: ipLimit.resetAt,
      },
      request,
    });

    return NextResponse.json({ error: "Zbyt wiele zgłoszeń. Spróbuj ponownie później." }, { status: 429 });
  }

  const turnstile = await verifyTurnstileToken(parsed.data.security?.turnstileToken, clientIp);

  if (!turnstile.success) {
    await safeLogAuditEvent({
      action: "lead.turnstile_blocked",
      entityId: email,
      entityType: "LeadForm",
      metadata: {
        errorCodes: turnstile.errorCodes,
        formType: "public_site_lead",
      },
      request,
    });

    return NextResponse.json({ error: "Nie udało się zweryfikować formularza. Spróbuj ponownie." }, { status: 403 });
  }

  try {
    const lead = await createPublicLead(parsed.data, {
      ipAddress: clientIp,
      referrer: request.headers.get("referer") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Public lead create failed", error);
    return NextResponse.json(
      { error: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie za chwilę." },
      { status: 500 },
    );
  }
}
