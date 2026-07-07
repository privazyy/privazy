import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type SafeErrorCode = "unauthorized" | "forbidden" | "validation_error" | "configuration_error" | "internal_error";

export type SafeErrorShape = {
  error: {
    code: SafeErrorCode;
    message: string;
  };
};

const secretPatterns = [
  /postgres(?:ql)?:\/\/[^\s"']+/gi,
  /sk-[A-Za-z0-9_-]+/g,
  /gh[oprs]_[A-Za-z0-9_]+/g,
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
];

export function redactSecretLikeValues(value: unknown): string {
  const input = value instanceof Error ? value.message : String(value ?? "");
  return secretPatterns.reduce((message, pattern) => message.replace(pattern, "[REDACTED]"), input);
}

export function toSafeErrorShape(error: unknown): SafeErrorShape {
  if (error instanceof ZodError) {
    return { error: { code: "validation_error", message: "Invalid request payload." } };
  }

  if (isSafeHttpError(error)) {
    return { error: { code: error.code, message: error.message } };
  }

  return { error: { code: "internal_error", message: "Unexpected server error." } };
}

export function safeJsonError(error: unknown) {
  const shape = toSafeErrorShape(error);

  return NextResponse.json(shape, { status: statusForSafeError(shape.error.code) });
}

export function safeHttpError(code: SafeErrorCode, message: string) {
  return { code, message };
}

export function statusForSafeError(code: SafeErrorCode) {
  if (code === "unauthorized") return 401;
  if (code === "forbidden") return 403;
  if (code === "validation_error") return 400;
  if (code === "configuration_error") return 503;
  return 500;
}

function isSafeHttpError(error: unknown): error is { code: SafeErrorCode; message: string } {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return typeof candidate.code === "string" && typeof candidate.message === "string";
}
