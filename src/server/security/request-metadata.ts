import "server-only";

import { createHash } from "node:crypto";

export function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function hashRequestValue(value: string | null | undefined) {
  if (!value) return undefined;

  const salt = process.env.AUDIT_LOG_HASH_SALT ?? process.env.AUTH_SECRET ?? "privazy-audit-log";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 32);
}

export function getRequestAuditMetadata(request: Request) {
  return {
    ipHash: hashRequestValue(getClientIp(request)),
    userAgentHash: hashRequestValue(request.headers.get("user-agent")),
  };
}
