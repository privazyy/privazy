import { publicApiError } from "@/server/security/public-api-errors";

type TurnstileVerifyInput = {
  remoteIp?: string;
  token?: string;
};

type TurnstileSiteVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(input: TurnstileVerifyInput) {
  const token = input.token?.trim();
  const environment = process.env.NODE_ENV ?? "development";
  const secret = process.env.TURNSTILE_SECRET_KEY ?? process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  const bypassAllowed = process.env.TURNSTILE_BYPASS_IN_DEV === "true" && environment !== "production";

  if (bypassAllowed) {
    return { ok: true, mode: "bypass" as const };
  }

  if (!token) {
    throw publicApiError("validation_error", "Potwierdź zabezpieczenie formularza i spróbuj ponownie.");
  }

  if (!secret) {
    throw publicApiError("configuration_error", "Zabezpieczenie formularza nie jest skonfigurowane.");
  }

  const formData = new FormData();
  formData.set("secret", secret);
  formData.set("response", token);
  if (input.remoteIp && input.remoteIp !== "unknown") {
    formData.set("remoteip", input.remoteIp);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    body: formData,
    method: "POST",
  });

  if (!response.ok) {
    throw publicApiError("forbidden", "Nie udało się zweryfikować formularza.");
  }

  const result = (await response.json()) as TurnstileSiteVerifyResponse;
  if (!result.success) {
    throw publicApiError("forbidden", "Nie udało się zweryfikować formularza.");
  }

  return { ok: true, mode: "turnstile" as const };
}

export function hasPublicTurnstileSiteKey(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY);
}
