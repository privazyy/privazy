import "server-only";

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { CmsAccessError } from "@/server/cms/cms-permissions";
import { CmsServiceError } from "@/server/cms/posts-service";

export async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new CmsServiceError(400, "INVALID_JSON", "Nieprawidlowy format JSON.");
  }
}

export function queryObject(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

export function cmsErrorResponse(error: unknown) {
  if (error instanceof CmsAccessError || error instanceof CmsServiceError) {
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
    return NextResponse.json(
      { error: "Rekord narusza ograniczenie unikalnosci.", code: "CONFLICT" },
      { status: 409 },
    );
  }

  console.error("CMS request failed", error);
  return NextResponse.json(
    { error: "Nie udalo sie wykonac operacji CMS.", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
