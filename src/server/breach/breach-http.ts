import "server-only";

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

export class BreachError extends Error {
  constructor(
    public readonly status: 400 | 401 | 403 | 404 | 409,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "BreachError";
  }
}

export async function parseBreachJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new BreachError(400, "INVALID_JSON", "Nieprawidlowy format JSON.");
  }
}

export function breachQueryObject(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

export function breachErrorResponse(error: unknown) {
  if (error instanceof BreachError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.details ? { details: error.details } : {}),
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

  console.error("Breach request failed", error);
  return NextResponse.json({ error: "Nie udalo sie wykonac operacji naruszenia.", code: "INTERNAL_ERROR" }, { status: 500 });
}
