import { NextResponse } from "next/server";

import { createIodLead, iodLeadPayloadSchema } from "@/server/leads/iod";
import { hasHoneypotValue } from "@/server/leads/iod-schema";
import { publicApiError, publicApiErrorResponse, toPublicApiError } from "@/server/security/public-api-errors";
import {
  assertRateLimit,
  checkRateLimit,
  invalidPayloadRateLimitKey,
  leadEmailRateLimitKey,
  leadIpRateLimitKey,
} from "@/server/security/rate-limit";
import { buildPublicRequestMetadata, getClientIp, hashIp } from "@/server/security/request-metadata";
import { verifyTurnstileToken } from "@/server/security/turnstile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_BYTES = 20_000;

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const ipHash = hashIp(clientIp);

  try {
    assertRateLimit(
      checkRateLimit([
        {
          key: leadIpRateLimitKey(ipHash),
          limit: 8,
          windowMs: 60_000,
        },
      ]),
    );

    const json = await readLimitedJson(request);
    const parsed = iodLeadPayloadSchema.safeParse(json);

    if (!parsed.success) {
      const invalidPayloadLimit = checkRateLimit([
        {
          key: invalidPayloadRateLimitKey(ipHash),
          limit: 4,
          windowMs: 60_000,
        },
      ]);
      if (!invalidPayloadLimit.allowed) {
        logAbuseEvent("invalid_payload_spike", ipHash);
      }
      assertRateLimit(invalidPayloadLimit);
      throw parsed.error;
    }

    const payload = parsed.data;

    assertRateLimit(
      checkRateLimit([
        {
          key: leadEmailRateLimitKey(payload.contact.email),
          limit: 3,
          windowMs: 60 * 60_000,
        },
      ]),
    );

    if (hasHoneypotValue(payload)) {
      logAbuseEvent("honeypot_triggered", ipHash);
      return neutralSuccess();
    }

    await verifyTurnstileToken({
      remoteIp: clientIp,
      token: payload.turnstileToken,
    });

    const result = await createIodLead(payload, buildPublicRequestMetadata(request));
    if (!result.created) {
      logAbuseEvent("duplicate_suppressed", ipHash);
    }

    return neutralSuccess();
  } catch (error) {
    const safeError = toPublicApiError(error);
    if (safeError.code === "rate_limited" || safeError.code === "forbidden") {
      logAbuseEvent(safeError.code, ipHash);
    }
    if (safeError.code === "configuration_error" || safeError.code === "internal_error") {
      console.error("IOD lead create failed", safeError);
    }

    return publicApiErrorResponse(error);
  }
}

async function readLimitedJson(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    throw publicApiError("bad_request", "Nieprawidłowy format danych.");
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    throw publicApiError("bad_request", "Nieprawidłowy format danych.");
  }

  if (body.length > MAX_BODY_BYTES) {
    throw publicApiError("bad_request", "Nieprawidłowy format danych.");
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw publicApiError("bad_request", "Nieprawidłowy format danych.");
  }
}

function neutralSuccess() {
  return NextResponse.json({ ok: true }, { status: 201 });
}

function logAbuseEvent(event: string, ipHash: string) {
  console.warn("public_form_abuse_event", {
    event,
    ipHash,
    route: "/api/leads/iod",
  });
}
