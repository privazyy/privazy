import "server-only";

import { createHash } from "node:crypto";

import { CommerceError } from "@/server/commerce/errors";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const maxBuckets = 10_000;

export function enforceCommerceRateLimit(
  request: Request,
  scope: string,
  options: { limit?: number; windowMs?: number } = {},
) {
  const limit = options.limit ?? 30;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();
  pruneBuckets(now);
  const key = `${scope}:${requestFingerprint(request)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (bucket.count >= limit) {
    throw new CommerceError(
      "rate_limited",
      "Zbyt wiele operacji. Spróbuj ponownie za chwilę.",
      429,
    );
  }

  bucket.count += 1;
}

function pruneBuckets(now: number) {
  if (buckets.size < maxBuckets) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }

  if (buckets.size >= maxBuckets) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey) buckets.delete(oldestKey);
  }
}

function requestFingerprint(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  return createHash("sha256")
    .update(`${ip}:${userAgent}`)
    .digest("hex")
    .slice(0, 24);
}
