import "server-only";

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

export class ClientPortalError extends Error {
  constructor(
    public readonly status: 400 | 401 | 403 | 404 | 409,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ClientPortalError";
  }
}

export async function parsePortalJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new ClientPortalError(400, "INVALID_JSON", "Nieprawidlowy format JSON.");
  }
}

export function portalQueryObject(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

export function clientPortalErrorResponse(error: unknown) {
  if (error instanceof ClientPortalError) {
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
    return NextResponse.json({ error: "Konflikt danych portalu.", code: "CONFLICT" }, { status: 409 });
  }

  console.error("Client portal request failed", error);
  return NextResponse.json(
    { error: "Nie udalo sie wykonac operacji portalu klienta.", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
