import "server-only";

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { CrmAccessError } from "@/server/crm/access";
import { CrmServiceError } from "@/server/crm/service";

export async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new CrmServiceError(400, "INVALID_JSON", "Nieprawidłowy format JSON.");
  }
}

export function queryObject(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

export function crmErrorResponse(error: unknown) {
  if (error instanceof CrmAccessError || error instanceof CrmServiceError) {
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
      { error: "Nieprawidłowe dane wejściowe.", code: "VALIDATION_ERROR", details: error.flatten() },
      { status: 400 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return NextResponse.json(
      { error: "Rekord narusza ograniczenie unikalności.", code: "CONFLICT" },
      { status: 409 },
    );
  }

  console.error("CRM request failed", error);
  return NextResponse.json(
    { error: "Nie udało się wykonać operacji CRM.", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
