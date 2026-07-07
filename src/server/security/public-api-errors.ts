import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type PublicApiErrorCode =
  | "bad_request"
  | "configuration_error"
  | "forbidden"
  | "internal_error"
  | "rate_limited"
  | "validation_error";

export type PublicApiError = {
  code: PublicApiErrorCode;
  message: string;
};

const statusByCode: Record<PublicApiErrorCode, number> = {
  bad_request: 400,
  configuration_error: 503,
  forbidden: 403,
  internal_error: 500,
  rate_limited: 429,
  validation_error: 400,
};

const secretPatterns = [
  /postgres(?:ql)?:\/\/[^\s"']+/gi,
  /sk-[A-Za-z0-9_-]+/g,
  /gh[oprs]_[A-Za-z0-9_]+/g,
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
  /0x4[A-Za-z0-9_-]+/g,
];

export function publicApiError(code: PublicApiErrorCode, message: string): PublicApiError {
  return { code, message };
}

export function publicApiErrorResponse(error: unknown) {
  const safeError = toPublicApiError(error);
  return NextResponse.json(
    {
      error: {
        code: safeError.code,
        message: safeError.message,
      },
    },
    { status: statusByCode[safeError.code] },
  );
}

export function toPublicApiError(error: unknown): PublicApiError {
  if (error instanceof ZodError) {
    return publicApiError("validation_error", "Uzupełnij wymagane dane formularza.");
  }

  if (isPublicApiError(error)) {
    return error;
  }

  return publicApiError("internal_error", "Nie udało się zapisać zgłoszenia. Spróbuj ponownie za chwilę.");
}

export function redactSecretLikeValues(value: unknown) {
  const input = value instanceof Error ? value.message : String(value ?? "");
  return secretPatterns.reduce((message, pattern) => message.replace(pattern, "[REDACTED]"), input);
}

function isPublicApiError(error: unknown): error is PublicApiError {
  if (!error || typeof error !== "object") return false;
  const candidate = error as Partial<PublicApiError>;
  return Boolean(candidate.code && candidate.message && candidate.code in statusByCode);
}
