import "server-only";

export type CommerceErrorCode =
  | "checkout_disabled"
  | "conflict"
  | "forbidden"
  | "invalid_input"
  | "not_found"
  | "rate_limited";

export class CommerceError extends Error {
  constructor(
    public readonly code: CommerceErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function safeCommerceError(error: unknown) {
  if (error instanceof CommerceError) {
    return {
      body: { code: error.code, error: error.message },
      status: error.status,
    };
  }

  return {
    body: {
      code: "internal_error",
      error: "Nie udało się wykonać operacji sklepu.",
    },
    status: 500,
  };
}
