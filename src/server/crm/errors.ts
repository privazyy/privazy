import "server-only";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { CrmAccessError } from "@/server/crm/access";

export class CrmServiceError extends Error {
  constructor(
    public readonly status: 400 | 404 | 409,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "CrmServiceError";
  }
}

export function toSafeCrmError(error: unknown) {
  if (error instanceof CrmAccessError || error instanceof CrmServiceError) {
    return {
      body: {
        error: error.message,
        code: error.code,
        ...("details" in error && error.details ? { details: error.details } : {}),
      },
      status: error.status,
    };
  }

  if (error instanceof z.ZodError) {
    return {
      body: { error: "Nieprawidlowe dane wejsciowe.", code: "VALIDATION_ERROR", details: error.flatten() },
      status: 400,
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return {
      body: { error: "Rekord narusza ograniczenie unikalnosci.", code: "CONFLICT" },
      status: 409,
    };
  }

  console.error("CRM request failed", error);
  return {
    body: { error: "Nie udalo sie wykonac operacji CRM.", code: "INTERNAL_ERROR" },
    status: 500,
  };
}
