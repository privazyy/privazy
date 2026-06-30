import "server-only";

import { z } from "zod";

const turnstileResponseSchema = z.object({
  "error-codes": z.array(z.string()).optional(),
  success: z.boolean(),
});

export type TurnstileVerificationResult =
  | { success: true; skipped?: true; reason?: string }
  | { errorCodes: string[]; success: false };

export async function verifyTurnstileToken(token: string | undefined, remoteIp: string | undefined): Promise<TurnstileVerificationResult> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  const isProduction = process.env.NODE_ENV === "production";

  if (!secret || secret === "replace_in_private_env") {
    if (isProduction) {
      return { errorCodes: ["missing-secret"], success: false };
    }

    return { reason: "missing-development-secret", skipped: true, success: true };
  }

  if (!token) {
    return { errorCodes: ["missing-token"], success: false };
  }

  const body = new URLSearchParams({
    response: token,
    secret,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    body,
    method: "POST",
  });

  if (!response.ok) {
    return { errorCodes: ["verification-request-failed"], success: false };
  }

  const parsed = turnstileResponseSchema.safeParse(await response.json());

  if (!parsed.success || !parsed.data.success) {
    return { errorCodes: parsed.success ? parsed.data["error-codes"] ?? [] : ["invalid-response"], success: false };
  }

  return { success: true };
}
