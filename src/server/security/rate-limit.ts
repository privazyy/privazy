import { publicApiError } from "@/server/security/public-api-errors";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitRule = {
  key: string;
  limit: number;
  windowMs: number;
};

const buckets = new Map<string, RateLimitBucket>();

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function checkRateLimit(rules: RateLimitRule[]): RateLimitResult {
  const now = Date.now();
  let retryAfterSeconds = 0;

  for (const rule of rules) {
    const bucket = buckets.get(rule.key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(rule.key, { count: 1, resetAt: now + rule.windowMs });
      continue;
    }

    bucket.count += 1;
    if (bucket.count > rule.limit) {
      retryAfterSeconds = Math.max(retryAfterSeconds, Math.ceil((bucket.resetAt - now) / 1000));
    }
  }

  return {
    allowed: retryAfterSeconds === 0,
    retryAfterSeconds,
  };
}

export function assertRateLimit(result: RateLimitResult) {
  if (!result.allowed) {
    throw publicApiError("rate_limited", "Zbyt wiele prób. Spróbuj ponownie za chwilę.");
  }
}

export function leadIpRateLimitKey(ipHash: string) {
  return `iod-lead:ip:${ipHash}`;
}

export function leadEmailRateLimitKey(email: string) {
  return `iod-lead:email:${email.toLowerCase()}`;
}

export function invalidPayloadRateLimitKey(ipHash: string) {
  return `iod-lead:invalid:${ipHash}`;
}
