import "server-only";

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { CrmAccessError } from "@/server/crm/access";

export class DsrServiceError extends Error {
  constructor(
    public readonly status: 400 | 404 | 409,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "DsrServiceError";
  }
}

export async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new DsrServiceError(400, "INVALID_JSON", "Nieprawidlowy format JSON.");
  }
}

export function queryObject(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

export function dsrErrorResponse(error: unknown) {
  if (error instanceof CrmAccessError || error instanceof DsrServiceError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...("details" in error && error.details ? { details: error.details } : {}),
      },
      { status: error.status },
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Nieprawidlowe dane wejsciowe.", code: "VALIDATION_ERROR", details: error.flatten() },
      { status: 400 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return NextResponse.json({ error: "Rekord narusza ograniczenie unikalnosci.", code: "CONFLICT" }, { status: 409 });
  }

  console.error("DSR request failed", error);
  return NextResponse.json({ error: "Nie udalo sie wykonac operacji DSR.", code: "INTERNAL_ERROR" }, { status: 500 });
}
