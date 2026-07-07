import { createHash } from "node:crypto";

export type PublicRequestMetadata = {
  ipHash?: string;
  referrer?: string;
  userAgentFamily?: string;
};

export function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function buildPublicRequestMetadata(request: Request): PublicRequestMetadata {
  const ip = getClientIp(request);

  return {
    ipHash: hashIp(ip),
    referrer: normalizeReferrer(request.headers.get("referer")),
    userAgentFamily: normalizeUserAgent(request.headers.get("user-agent")),
  };
}

export function hashIp(ip: string) {
  const salt = process.env.ABUSE_LOG_HASH_SALT ?? "privazy-public-form";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 24);
}

export function normalizeReferrer(value: string | null) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return value.slice(0, 120);
  }
}

export function normalizeUserAgent(value: string | null) {
  if (!value) return undefined;
  if (/bot|crawler|spider/i.test(value)) return "bot-like";
  if (/mobile/i.test(value)) return "mobile";
  if (/chrome/i.test(value)) return "chrome";
  if (/safari/i.test(value)) return "safari";
  if (/firefox/i.test(value)) return "firefox";
  if (/edge/i.test(value)) return "edge";
  return "other";
}
