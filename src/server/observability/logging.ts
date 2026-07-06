const sensitiveKeyPattern = /(authorization|cookie|email|filekey|key|nip|password|phone|secret|session|signature|token)/i;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const bearerPattern = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const urlSecretPattern = /\b(postgres(?:ql)?:\/\/)[^\s]+/gi;
const longTokenPattern = /\b[A-Za-z0-9_-]{24,}\b/g;

export function createRequestId(prefix = "req") {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function safeErrorMessage(error: unknown, fallback = "Unexpected application error", nodeEnv = process.env.NODE_ENV) {
  if (!(error instanceof Error)) return fallback;
  return nodeEnv === "development" ? redactSensitiveValue(error.message) : fallback;
}

export function redactSensitiveValue(value: string) {
  return value
    .replace(urlSecretPattern, "$1[redacted]")
    .replace(bearerPattern, "Bearer [redacted]")
    .replace(emailPattern, "[redacted-email]")
    .replace(longTokenPattern, "[redacted-token]");
}

export function redactLogValue(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[redacted-depth]";
  if (typeof value === "string") return redactSensitiveValue(value);
  if (Array.isArray(value)) return value.map((item) => redactLogValue(item, depth + 1));
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [
      key,
      sensitiveKeyPattern.test(key) ? "[redacted]" : redactLogValue(nested, depth + 1),
    ]),
  );
}
